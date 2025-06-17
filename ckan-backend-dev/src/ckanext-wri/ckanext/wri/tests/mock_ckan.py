from __future__ import print_function

import json
import re
import copy
import os
from urllib.parse import unquote_plus

from threading import Thread

from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer


PORT = 8998


class MockCkanHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/files/"):
            file_path = self.path[len("/files/") :]
            try:
                with open(os.path.join("resource_files", file_path), "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.end_headers()
                self.wfile.write(content)
                return
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                return

        # test name is the first bit of the URL and makes CKAN behave
        # differently in some way.
        # Its value is recorded and then removed from the path
        self.test_name = None
        test_name_match = re.match("^/([^/]+)/", self.path)
        if test_name_match:
            self.test_name = test_name_match.groups()[0]
            if self.test_name == "api":
                self.test_name = None
            else:
                self.path = re.sub("^/([^/]+)/", "/", self.path)
        if self.test_name == "site_down":
            return self.respond("Site is down", status=500)

        # The API version is recorded and then removed from the path
        api_version = None
        version_match = re.match(r"^/api/(\d)", self.path)
        if version_match:
            api_version = int(version_match.groups()[0])
            self.path = re.sub(r"^/api/(\d)/", "/api/", self.path)

        if self.path == "/api/rest/package":
            if api_version == 2:
                dataset_refs = [d["id"] for d in DATASETS]
            else:
                dataset_refs = [d["name"] for d in DATASETS]
            return self.respond_json(dataset_refs)
        if self.path == "/api/action/package_list":
            dataset_names = [d["name"] for d in DATASETS]
            return self.respond_action(dataset_names)
        if self.path.startswith("/api/rest/package/"):
            dataset_ref = self.path.split("/")[-1]
            dataset = self.get_dataset(dataset_ref)
            if dataset:
                return self.respond_json(convert_dataset_to_restful_form(dataset))
        if self.path.startswith("/api/action/package_show"):
            params = self.get_url_params()
            dataset_ref = params["id"]
            dataset = self.get_dataset(dataset_ref)
            if dataset:
                return self.respond_action(dataset)
        if self.path.startswith("/api/action/group_show"):
            params = self.get_url_params()
            group_ref = params["id"]
            group = self.get_group(group_ref)
            if group:
                return self.respond_action(group)

        if self.path.startswith("/api/search/dataset"):
            params = self.get_url_params()
            if params.keys() == ["organization"]:
                org = self.get_org(params["organization"])
                dataset_ids = [d["id"] for d in DATASETS if d["owner_org"] == org["id"]]
                return self.respond_json(
                    {"count": len(dataset_ids), "results": dataset_ids}
                )
            else:
                return self.respond(
                    "Not implemented search params %s" % params, status=400
                )
        if self.path.startswith("/api/search/revision"):
            revision_ids = [r["id"] for r in REVISIONS]
            return self.respond_json(revision_ids)
        if self.path.startswith("/api/rest/revision/"):
            revision_ref = self.path.split("/")[-1]
            assert api_version == 2
            for rev in REVISIONS:
                if rev["id"] == revision_ref:
                    return self.respond_json(rev)
            self.respond("Cannot find revision", status=404)
        # /api/3/action/package_search?fq=metadata_modified:[2015-10-23T14:51:13.282361Z TO *]&rows=1000
        if self.path.startswith("/api/action/package_search"):
            params = self.get_url_params()
            start = params.get("start", "0")
            fq_list = params.get("fq", [])

            if isinstance(fq_list, str):
                fq_list = [fq_list]

            datasets = DATASETS

            if self.test_name == "datasets_added":
                if start == "0":
                    datasets = [DATASETS[0]]
                elif start == "100":
                    datasets = DATASETS
            else:
                if start == "0":
                    for fq in fq_list:
                        fq = fq.strip("()")

                        if fq.startswith("-organization:"):
                            org_name = fq.split(":", 1)[1]

                            datasets = [
                                d for d in datasets
                                if d.get("organization", {}).get("name") != org_name
                            ]

                        elif fq.startswith("organization:"):
                            org_name = fq.split(":", 1)[1]

                            datasets = [
                                d for d in datasets
                                if d.get("organization", {}).get("name") == org_name
                            ]
                        elif fq.startswith("-groups:"):
                            group_name = fq.split(":", 1)[1]

                            datasets = [
                                d for d in datasets
                                if group_name not in [g["name"] for g in d.get("groups", [])]
                            ]
                        elif fq.startswith("groups:"):
                            group_name = fq.split(":", 1)[1]

                            datasets = [
                                d for d in datasets
                                if group_name in [g["name"] for g in d.get("groups", [])]
                            ]
                        elif "metadata_modified" in fq:
                            assert "+TO+" not in fq
                            datasets = [DATASETS[1]]
                        else:
                            datasets = DATASETS
                else:
                    datasets = []

            dataset_names = [d["name"] for d in datasets]

            out = {
                "count": len(dataset_names),
                "results": [self.get_dataset(name) for name in dataset_names],
            }

            return self.respond_action(out)

        # if we wanted to server a file from disk, then we'd call this:
        # return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

        self.respond("Mock CKAN doesnt recognize that call", status=400)

    def get_dataset(self, dataset_ref):
        for dataset in DATASETS:
            if dataset["name"] == dataset_ref or dataset["id"] == dataset_ref:
                if self.test_name == "invalid_tag":
                    dataset["tags"] = INVALID_TAGS
                return dataset

    def get_group(self, group_ref):
        for group in GROUPS:
            if group["name"] == group_ref or group["id"] == group_ref:
                return group

    def get_org(self, org_ref):
        for org in ORGS:
            if org["name"] == org_ref or org["id"] == org_ref:
                return org

    def get_url_params(self):
        params_str = self.path.split("?")[-1]
        params_unicode = unquote_plus(params_str)
        params = params_unicode.split("&")
        return dict([param.split("=") for param in params])

    def respond_action(self, result_dict, status=200):
        response_dict = {"result": result_dict, "success": True}
        return self.respond_json(response_dict, status=status)

    def respond_json(self, content_dict, status=200):
        return self.respond(
            json.dumps(content_dict), status=status, content_type="application/json"
        )

    def respond(self, content, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))
        self.wfile.close()


def serve(port=PORT):
    """Runs a CKAN-alike app (over HTTP) that is used for harvesting tests"""

    # Choose the directory to serve files from
    # os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),
    #                      'mock_ckan_files'))

    os.chdir(os.path.join(os.path.dirname(__file__), "test_resource_files"))

    class TestServer(TCPServer):
        allow_reuse_address = True

    httpd = TestServer(("", PORT), MockCkanHandler)

    print("Serving test HTTP server at port {}".format(PORT))

    httpd_thread = Thread(target=httpd.serve_forever)
    httpd_thread.setDaemon(True)
    httpd_thread.start()


def convert_dataset_to_restful_form(dataset):
    dataset = copy.deepcopy(dataset)
    dataset["extras"] = dict([(e["key"], e["value"]) for e in dataset["extras"]])
    dataset["tags"] = [t["name"] for t in dataset.get("tags", [])]
    return dataset


DATASETS = [
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "cautions": '\u003cp\u003eThis data is part of a research archive and represents outdated or legacy data. The \u003ca href="/datasets/dominant-drivers-of-tree-cover-loss-at-1km"\u003elatest update of this dataset\u003c/a\u003e is always available in another catalog entry.\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003e\n\u003cp\u003eThis product shows the dominant driver in each 1 km cell over the entire period. It does not show multiple drivers if they occur in the same cell at smaller scales, nor does it detail the sequence of drivers if multiple occurred at different times within the period.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThis product does not distinguish between the loss of natural forest and planted trees (e.g., plantations, tree crops, or agroforestry systems). While tree cover loss associated with the permanent agriculture, hard commodities, and settlements &amp; infrastructure classes represent a close approximation of deforestation, they do not always represent the conversion of natural forests to other land uses and in some cases may represent loss of planted trees. Similarly, replacement of natural forest with wood fiber plantations is not distinguished from routine harvesting within existing plantations established before 2000, as these are both included in the logging class.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThese data are limited in scope to attributing drivers to tree cover loss as mapped by the Hansen et al. (2013) tree cover loss product, and therefore the detection of loss is subject to the accuracy of that product. A full description of limitations is included in the publication.\u003c/p\u003e\n\u003c/li\u003e\n\u003c/ul\u003e',
        "citation": "Sims, M. J., Stanimirova, R., Raichuk, A., Neumann, M., Richter, J., Follett, F., MacCarthy, J., Lister, K., Randle, C., Sloat, L., Esipova, E., Jupiter, J., Stanton, C., Morris, D., Slay, C. M., Purves, D., & Harris, N. (2025). Global drivers of forest loss at 1 km resolution. Environmental Research Letters. https://doi.org/10.1088/1748-9326/add606",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2023.",
        "has_chart_views": False,
        "id": "b1d735e9-cbe1-42f7-ad84-1cb1cb6fd327",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://www.globalforestwatch.org/blog/data-and-tools/new-drivers-data-forest-loss",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "metadata_created": "2025-05-22T13:41:01.402873",
        "metadata_modified": "2025-05-22T13:42:04.673439",
        "methodology": '\u003cp\u003eThese data were produced by the World Resources Institute and Google DeepMind. The data were developed using a global neural network model (ResNet) trained on a \u003ca href="https://zenodo.org/records/15225267"\u003eset of 6,955 samples collected through visual interpretation\u003c/a\u003e of very high-resolution satellite imagery. The model used satellite imagery (Landsat 7 &amp; 8, Sentinel-2) and ancillary data to classify the seven driver categories.\u003c/p\u003e\n\u003cp\u003eOverall accuracy of the model is 90.5%, with regional accuracies varying from 82.8% in Southeast Asia to 94.1% in Asia. Global per class producer’s and user’s accuracy are highest for the permanent agriculture, logging, and wildfire classes (over 90%), and generally lower for rarer classes, such as hard commodities, settlements and infrastructure, and other natural disturbances. A full description of the methods and accuracy statistics are available in the publication.\u003c/p\u003e',
        "name": "dominant-drivers-of-tree-cover-loss-at-1km-v1-1",
        "notes": "\u003cp\u003eThis dataset contains the dominant driver of tree cover loss from 2001-2023. A \u003cem\u003edriver\u003c/em\u003e is defined as the direct cause of tree cover loss, and can include both temporary disturbances (natural or anthropogenic) or permanent loss of tree cover due to a change to a non-forest land use (e.g., deforestation). The \u003cem\u003edominant\u003c/em\u003e driver is defined as the direct driver that caused the majority of tree cover loss within each 1 km cell over a time period.\u003c/p\u003e\n\u003cp\u003eClasses of drivers are defined as follows:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003ePermanent agriculture: Long-term, permanent tree cover loss for small- to large-scale agriculture.\u003c/li\u003e\n\u003cli\u003eHard commodities: Loss due to the establishment or expansion of mining or energy infrastructure.\u003c/li\u003e\n\u003cli\u003eShifting cultivation: Tree cover loss due to small- to medium-scale clearing for temporary cultivation that is later abandoned and followed by subsequent regrowth of secondary forest or vegetation.\u003c/li\u003e\n\u003cli\u003eLogging: Forest management and logging activities occurring within managed, natural or semi-natural forests and plantations, often with evidence of forest regrowth or planting in subsequent years.\u003c/li\u003e\n\u003cli\u003eWildfire: Tree cover loss due to fire with no visible human conversion or agricultural activity afterward. Fires may be started by natural causes (e.g. lightning) or may be related to human activities (accidental or deliberate).\u003c/li\u003e\n\u003cli\u003eSettlements and infrastructure: Tree cover loss due to expansion and intensification of roads, settlements, urban areas, or built infrastructure (not associated with other classes).\u003c/li\u003e\n\u003cli\u003eOther natural disturbances: Tree cover loss due to other non-fire natural disturbances (e.g., landslides, insect outbreaks, river meandering). If loss due to natural causes is followed by salvage or sanitation logging, it is classified as forest management.\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThe data is available for download as a global raster file with 8 bands, 8-bit pixel values, and 0.01-degree spatial resolution. The first band is a classification of the dominant driver for the full time period (2001-2023). The pixel values 1 through 7 correspond to the seven classifications of drivers and 255 corresponds to NoData. The other seven bands contain the probability of each driver. Probabilities should be interpreted as a relative confidence between the classes, rather than a True estimate of the likelihood of each class.\u003c/p\u003e\n\u003cp\u003eThe pixel values for the probability bands should NOT be interpreted as an integer percentage (i.e. \u003cem\u003e1 means 1%\u003c/em\u003e, \u003cem\u003e2 means 2%\u003c/em\u003e, ... is False). Instead more dynamic range is provided and the percentage between 0%-100% is quantized into 250 levels each corresponding to a 0.4% increment rather than a 1% increment. The formula that can be used to calculate the percentage probability for a driver is \u003ccode\u003edriver_probability_pct = uint8(pixel_value) * 0.4\u003c/code\u003e . Valid pixel values are between 0 and 250 inclusive. The pixel value of 255 is NoData.\u003c/p\u003e\n\u003cp\u003eThe Cloud Optimized GeoTIFF (COG) available for download:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eBand 1: Dominant driver classification (categorical) over the time period\u003c/li\u003e\n\u003cli\u003e1 = Permanent agriculture\u003c/li\u003e\n\u003cli\u003e2 = Hard commodities\u003c/li\u003e\n\u003cli\u003e3 = Shifting cultivation\u003c/li\u003e\n\u003cli\u003e4 = Logging\u003c/li\u003e\n\u003cli\u003e5 = Wildfire\u003c/li\u003e\n\u003cli\u003e6 = Settlements and infrastructure\u003c/li\u003e\n\u003cli\u003e7 = Other natural disturbances\u003c/li\u003e\n\u003cli\u003eBand 2: Permanent agriculture - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 3: Hard commodities - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 4: Shifting cultivation - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 5: Logging - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 6: Wildfire - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 7: Settlements and infrastructure - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 8: Other natural disturbances - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003c/ul\u003e",
        "num_resources": 2,
        "num_tags": 1,
        "open_in": "[]",
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2023.",
        "spatial_address": "Global",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://doi.org/10.1088/1748-9326/add606",
        "title": "Global drivers of forest loss at 1 km resolution - Version 1.1",
        "type": "dataset",
        "update_frequency": "annually",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data related to tree cover, deforestation, reforestation, and forest biodiversity.",
                "display_name": "Forests",
                "id": "c74fae7a-9b54-4c02-b7b5-e3ca00bff8ef",
                "image_display_url": "",
                "name": "forests",
                "title": "Forests",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-22T13:41:01.405038",
                "datastore_active": False,
                "description": "Version 1.1 available as a web map layer.",
                "format": "Layer",
                "hash": "",
                "id": "0865a285-9c19-466f-9eed-9dce9cd15d98",
                "last_modified": None,
                "metadata_modified": "2025-05-22T13:42:04.683769",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Dominant Driver Map Layer",
                "package_id": "b1d735e9-cbe1-42f7-ad84-1cb1cb6fd327",
                "position": 0,
                "resource_type": None,
                "rw_id": "a66fdca9-aa28-42da-a175-ccedb584ba56",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/b34ef0b2-fd10-4adc-809d-5fd33f2521c9/layer/a66fdca9-aa28-42da-a175-ccedb584ba56",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-22T13:42:04.697900",
                "datastore_active": False,
                "description": "Version 1.1 (2001-2023). Raster file in EPSG:4326 (WGS84) coordinate system at 0.01° resolution. See dataset description for how to interpret the 8 raster bands.",
                "format": "tif",
                "hash": "",
                "id": "fbed7618-a950-4d9c-b277-ef32981233e4",
                "last_modified": "2025-05-22T13:42:04.503246",
                "metadata_modified": "2025-05-22T13:42:04.685744",
                "mimetype": "image/tiff",
                "mimetype_inner": None,
                "name": "Cloud Optimized Geotiff - v1.1",
                "package_id": "b1d735e9-cbe1-42f7-ad84-1cb1cb6fd327",
                "position": 1,
                "resource_type": None,
                "size": 289622025,
                "state": "active",
                "title": "Cloud Optimized Geotiff - v1.1",
                "url": "http://localhost:8998/files/drivers_forest_loss_1km_2001_2023_v1_1.tif",
                "url_type": "upload",
            },
        ],
        "tags": [
            {
                "display_name": "raster",
                "id": "36f3d667-e68f-402e-86d3-0fe96419476f",
                "name": "raster",
                "state": "active",
                "vocabulary_id": None,
            }
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "cautions": "\u003cul\u003e\n\u003cli\u003e\n\u003cp\u003eThis product shows the dominant driver in each 1 km cell over the entire period. It does not show multiple drivers if they occur in the same cell at smaller scales, nor does it detail the sequence of drivers if multiple occurred at different times within the period.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThis product does not distinguish between the loss of natural forest and planted trees (e.g., plantations, tree crops, or agroforestry systems). While tree cover loss associated with the permanent agriculture, hard commodities, and settlements &amp; infrastructure classes represent a close approximation of deforestation, they do not always represent the conversion of natural forests to other land uses and in some cases may represent loss of planted trees. Similarly, replacement of natural forest with wood fiber plantations is not distinguished from routine harvesting within existing plantations established before 2000, as these are both included in the logging class.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThese data are limited in scope to attributing drivers to tree cover loss as mapped by the Hansen et al. (2013) tree cover loss product, and therefore the detection of loss is subject to the accuracy of that product. A full description of limitations is included in the publication.\u003c/p\u003e\n\u003c/li\u003e\n\u003c/ul\u003e",
        "citation": "Sims, M. J., Stanimirova, R., Raichuk, A., Neumann, M., Richter, J., Follett, F., MacCarthy, J., Lister, K., Randle, C., Sloat, L., Esipova, E., Jupiter, J., Stanton, C., Morris, D., Slay, C. M., Purves, D., & Harris, N. (2025). Global drivers of forest loss at 1 km resolution. Environmental Research Letters. https://doi.org/10.1088/1748-9326/add606",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2024. This is the latest update to this dataset.",
        "has_chart_views": False,
        "id": "64c5c873-c3f8-4fe6-8502-63dcd59d5473",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://www.globalforestwatch.org/blog/data-and-tools/new-drivers-data-forest-loss",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "metadata_created": "2025-05-21T15:55:32.532655",
        "metadata_modified": "2025-05-21T15:55:41.568728",
        "methodology": '\u003cp\u003eThese data were produced by the World Resources Institute and Google DeepMind. The data were developed using a global neural network model (ResNet) trained on a \u003ca href="https://zenodo.org/records/15366671"\u003eset of 6,955 samples collected through visual interpretation\u003c/a\u003e of very high-resolution satellite imagery. The model used satellite imagery (Landsat 7 &amp; 8, Sentinel-2) and ancillary data to classify the seven driver categories.\u003c/p\u003e\n\u003cp\u003eOverall accuracy of the model is 90.5%, with regional accuracies varying from 82.8% in Southeast Asia to 94.1% in Asia. Global per class producer’s and user’s accuracy are highest for the permanent agriculture, logging, and wildfire classes (over 90%), and generally lower for rarer classes, such as hard commodities, settlements and infrastructure, and other natural disturbances. A full description of the methods and accuracy statistics are available in the publication.\u003c/p\u003e',
        "name": "dominant-drivers-of-tree-cover-loss-at-1km",
        "notes": "\u003cp\u003eThis dataset contains the dominant driver of tree cover loss from 2001-2024. A \u003cem\u003edriver\u003c/em\u003e is defined as the direct cause of tree cover loss, and can include both temporary disturbances (natural or anthropogenic) or permanent loss of tree cover due to a change to a non-forest land use (e.g., deforestation). The \u003cem\u003edominant\u003c/em\u003e driver is defined as the direct driver that caused the majority of tree cover loss within each 1 km cell over a time period.\u003c/p\u003e\n\u003cp\u003eClasses of drivers are defined as follows:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003ePermanent agriculture: Long-term, permanent tree cover loss for small- to large-scale agriculture.\u003c/li\u003e\n\u003cli\u003eHard commodities: Loss due to the establishment or expansion of mining or energy infrastructure.\u003c/li\u003e\n\u003cli\u003eShifting cultivation: Tree cover loss due to small- to medium-scale clearing for temporary cultivation that is later abandoned and followed by subsequent regrowth of secondary forest or vegetation.\u003c/li\u003e\n\u003cli\u003eLogging: Forest management and logging activities occurring within managed, natural or semi-natural forests and plantations, often with evidence of forest regrowth or planting in subsequent years.\u003c/li\u003e\n\u003cli\u003eWildfire: Tree cover loss due to fire with no visible human conversion or agricultural activity afterward. Fires may be started by natural causes (e.g. lightning) or may be related to human activities (accidental or deliberate).\u003c/li\u003e\n\u003cli\u003eSettlements and infrastructure: Tree cover loss due to expansion and intensification of roads, settlements, urban areas, or built infrastructure (not associated with other classes).\u003c/li\u003e\n\u003cli\u003eOther natural disturbances: Tree cover loss due to other non-fire natural disturbances (e.g., landslides, insect outbreaks, river meandering). If loss due to natural causes is followed by salvage or sanitation logging, it is classified as forest management.\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThe data is available for download as a global raster file with 8 bands, 8-bit pixel values, and 0.01-degree spatial resolution. The first band is a classification of the dominant driver for the full time period (2001-2024). The pixel values 1 through 7 correspond to the seven classifications of drivers and 255 corresponds to NoData. The other seven bands contain the probability of each driver. Probabilities should be interpreted as a relative confidence between the classes, rather than a True estimate of the likelihood of each class.\u003c/p\u003e\n\u003cp\u003eThe pixel values for the probability bands should NOT be interpreted as an integer percentage (i.e. \u003cem\u003e1 means 1%\u003c/em\u003e, \u003cem\u003e2 means 2%\u003c/em\u003e, ... is False). Instead more dynamic range is provided and the percentage contribution between 0%-100% is quantized into 250 levels each corresponding to a 0.4% increment rather than a 1% increment. The formula that can be used to calculate the percentage probability for a driver is \u003cstrong\u003edriver_probability_pct = uint8(pixel_value) * 0.4\u003c/strong\u003e . Valid pixel values are between 0 and 250 inclusive. The pixel value of 255 is NoData.\u003c/p\u003e\n\u003cp\u003eThe Cloud Optimized GeoTIFF (COG) available for download:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eBand 1: Dominant driver classification (categorical) over the time period\u003c/li\u003e\n\u003cli\u003e1 = Permanent agriculture\u003c/li\u003e\n\u003cli\u003e2 = Hard commodities\u003c/li\u003e\n\u003cli\u003e3 = Shifting cultivation\u003c/li\u003e\n\u003cli\u003e4 = Logging\u003c/li\u003e\n\u003cli\u003e5 = Wildfire\u003c/li\u003e\n\u003cli\u003e6 = Settlements and infrastructure\u003c/li\u003e\n\u003cli\u003e7 = Other natural disturbances\u003c/li\u003e\n\u003cli\u003eBand 2: Permanent agriculture - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 3: Hard commodities - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 4: Shifting cultivation - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 5: Logging - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 6: Wildfire - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 7: Settlements and infrastructure - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 8: Other natural disturbances - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003c/ul\u003e",
        "num_resources": 2,
        "num_tags": 1,
        "open_in": '[{"title":"Global Forest Watch","url":"https://www.globalforestwatch.org/map/?map=eyJkYXRhc2V0cyI6W3siZGF0YXNldCI6InRyZWUtY292ZXItbG9zcy1ieS1kb21pbmFudC1kcml2ZXIiLCJvcGFjaXR5IjoxLCJ2aXNpYmlsaXR5Ijp0cnVlLCJsYXllcnMiOlsidHJlZS1jb3Zlci1sb3NzLWJ5LWRvbWluYW50LWRyaXZlciJdfSx7ImRhdGFzZXQiOiJwb2xpdGljYWwtYm91bmRhcmllcyIsImxheWVycyI6WyJkaXNwdXRlZC1wb2xpdGljYWwtYm91bmRhcmllcyIsInBvbGl0aWNhbC1ib3VuZGFyaWVzIl0sIm9wYWNpdHkiOjEsInZpc2liaWxpdHkiOnRydWV9XX0%3D"}]',
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2024. This is the latest update for this dataset.",
        "spatial_address": "Global",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://doi.org/10.1088/1748-9326/add606",
        "title": "Global drivers of forest loss at 1 km resolution - Version 1.2",
        "type": "dataset",
        "update_frequency": "annually",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data related to tree cover, deforestation, reforestation, and forest biodiversity.",
                "display_name": "Forests",
                "id": "c74fae7a-9b54-4c02-b7b5-e3ca00bff8ef",
                "image_display_url": "",
                "name": "forests",
                "title": "Forests",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-21T15:55:32.534344",
                "datastore_active": False,
                "description": "Version 1.2 available as a web map layer.",
                "format": "Layer",
                "hash": "",
                "id": "6a8d6f91-b143-4ef1-b862-a971e4f2cae0",
                "last_modified": None,
                "metadata_modified": "2025-05-21T15:55:41.580817",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Dominant Driver Map Layer",
                "package_id": "64c5c873-c3f8-4fe6-8502-63dcd59d5473",
                "position": 0,
                "resource_type": None,
                "rw_id": "c860b7df-eabc-4a35-97d3-8cebe872feea",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/6a3f49ed-f471-44bb-8e05-cede40a7d60b/layer/c860b7df-eabc-4a35-97d3-8cebe872feea",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-21T15:55:41.595130",
                "datastore_active": False,
                "description": "Version 1.2 (2001-2024). Raster file in EPSG:4326 (WGS84) coordinate system at 0.01° resolution. See dataset description for how to interpret the 8 raster bands.",
                "format": "tif",
                "hash": "",
                "id": "a6687c10-de73-4d73-9439-73f6306951b8",
                "last_modified": "2025-05-21T15:55:41.388637",
                "metadata_modified": "2025-05-21T15:55:41.582934",
                "mimetype": "image/tiff",
                "mimetype_inner": None,
                "name": "Cloud Optimized Geotiff - v1.2",
                "package_id": "64c5c873-c3f8-4fe6-8502-63dcd59d5473",
                "position": 1,
                "resource_type": None,
                "size": 295058128,
                "state": "active",
                "title": "Cloud Optimized Geotiff - v1.2",
                "url": "http://localhost:8998/files/drivers_forest_loss_1km_2001_2024_v1_2.tif",
                "url_type": "upload",
            },
        ],
        "tags": [
            {
                "display_name": "raster",
                "id": "36f3d667-e68f-402e-86d3-0fe96419476f",
                "name": "raster",
                "state": "active",
                "vocabulary_id": None,
            }
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "cautions": '\u003cp\u003eThis data is part of a research archive and represents outdated or legacy data. The \u003ca href="/datasets/dominant-drivers-of-tree-cover-loss-at-1km"\u003elatest update of this dataset\u003c/a\u003e is always available in another catalog entry.\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003e\n\u003cp\u003eThis product shows the dominant driver in each 1 km cell over the entire period. It does not show multiple drivers if they occur in the same cell at smaller scales, nor does it detail the sequence of drivers if multiple occurred at different times within the period.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThis product does not distinguish between the loss of natural forest and planted trees (e.g., plantations, tree crops, or agroforestry systems). While tree cover loss associated with the permanent agriculture, hard commodities, and settlements &amp; infrastructure classes represent a close approximation of deforestation, they do not always represent the conversion of natural forests to other land uses and in some cases may represent loss of planted trees. Similarly, replacement of natural forest with wood fiber plantations is not distinguished from routine harvesting within existing plantations established before 2000, as these are both included in the logging class.\u003c/p\u003e\n\u003c/li\u003e\n\u003cli\u003e\n\u003cp\u003eThese data are limited in scope to attributing drivers to tree cover loss as mapped by the Hansen et al. (2013) tree cover loss product, and therefore the detection of loss is subject to the accuracy of that product. A full description of limitations is included in the publication.\u003c/p\u003e\n\u003c/li\u003e\n\u003c/ul\u003e',
        "citation": "Sims, M. J., Stanimirova, R., Raichuk, A., Neumann, M., Richter, J., Follett, F., MacCarthy, J., Lister, K., Randle, C., Sloat, L., Esipova, E., Jupiter, J., Stanton, C., Morris, D., Slay, C. M., Purves, D., & Harris, N. (2025). Global drivers of forest loss at 1 km resolution. Environmental Research Letters. https://doi.org/10.1088/1748-9326/add606",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2022. This specific version is the data associated with an original peer reviewed research paper released in 2025.",
        "has_chart_views": False,
        "id": "5162a96b-80e0-4824-8bff-cac37b27cd5f",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://www.globalforestwatch.org/blog/data-and-tools/new-drivers-data-forest-loss",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            },
        ],
        "metadata_created": "2025-05-21T14:26:46.151796",
        "metadata_modified": "2025-05-21T14:26:55.180723",
        "methodology": '\u003cp\u003eThese data were produced by the World Resources Institute and Google DeepMind. The data were developed using a global neural network model (ResNet) trained on a \u003ca href="https://zenodo.org/records/15224684"\u003eset of 6,955 samples collected through visual interpretation\u003c/a\u003e of very high-resolution satellite imagery. The model used satellite imagery (Landsat 7 &amp; 8, Sentinel-2) and ancillary data to classify the seven driver categories.\u003c/p\u003e\n\u003cp\u003eOverall accuracy of the model is 90.5%, with regional accuracies varying from 82.8% in Southeast Asia to 94.1% in Asia. Global per class producer’s and user’s accuracy are highest for the permanent agriculture, logging, and wildfire classes (over 90%), and generally lower for rarer classes, such as hard commodities, settlements and infrastructure, and other natural disturbances. A full description of the methods and accuracy statistics are available in the publication.\u003c/p\u003e',
        "name": "dominant-drivers-of-tree-cover-loss-at-1km-v1-0",
        "notes": "\u003cp\u003eThis dataset contains the dominant driver of tree cover loss from 2001-2022. A \u003cem\u003edriver\u003c/em\u003e is defined as the direct cause of tree cover loss, and can include both temporary disturbances (natural or anthropogenic) or permanent loss of tree cover due to a change to a non-forest land use (e.g., deforestation). The \u003cem\u003edominant\u003c/em\u003e driver is defined as the direct driver that caused the majority of tree cover loss within each 1 km cell over a time period.\u003c/p\u003e\n\u003cp\u003eClasses of drivers are defined as follows:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003ePermanent agriculture: Long-term, permanent tree cover loss for small- to large-scale agriculture.\u003c/li\u003e\n\u003cli\u003eHard commodities: Loss due to the establishment or expansion of mining or energy infrastructure.\u003c/li\u003e\n\u003cli\u003eShifting cultivation: Tree cover loss due to small- to medium-scale clearing for temporary cultivation that is later abandoned and followed by subsequent regrowth of secondary forest or vegetation.\u003c/li\u003e\n\u003cli\u003eLogging: Forest management and logging activities occurring within managed, natural or semi-natural forests and plantations, often with evidence of forest regrowth or planting in subsequent years.\u003c/li\u003e\n\u003cli\u003eWildfire: Tree cover loss due to fire with no visible human conversion or agricultural activity afterward. Fires may be started by natural causes (e.g. lightning) or may be related to human activities (accidental or deliberate).\u003c/li\u003e\n\u003cli\u003eSettlements and infrastructure: Tree cover loss due to expansion and intensification of roads, settlements, urban areas, or built infrastructure (not associated with other classes).\u003c/li\u003e\n\u003cli\u003eOther natural disturbances: Tree cover loss due to other non-fire natural disturbances (e.g., landslides, insect outbreaks, river meandering). If loss due to natural causes is followed by salvage or sanitation logging, it is classified as forest management.\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThe data is available for download as a global raster file with 8 bands, 8-bit pixel values, and 0.01-degree spatial resolution. The first band is a classification of the dominant driver for the full time period (2001-2022). The pixel values 1 through 7 correspond to the seven classifications of drivers and 255 corresponds to NoData. The other seven bands contain the probability of each driver. Probabilities should be interpreted as a relative confidence between the classes, rather than a True estimate of the likelihood of each class.\u003c/p\u003e\n\u003cp\u003eThe pixel values for the probability bands should NOT be interpreted as an integer percentage (i.e. \u003cem\u003e1 means 1%\u003c/em\u003e, \u003cem\u003e2 means 2%\u003c/em\u003e, ... is False). Instead more dynamic range is provided and the percentage between 0%-100% is quantized into 250 levels each corresponding to a 0.4% increment rather than a 1% increment. The formula that can be used to calculate the percentage probability for a driver is \u003ccode\u003edriver_probability_pct = uint8(pixel_value) * 0.4\u003c/code\u003e . Valid pixel values are between 0 and 250 inclusive. The pixel value of 255 is NoData.\u003c/p\u003e\n\u003cp\u003eThe Cloud Optimized GeoTIFF (COG) available for download:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eBand 1: Dominant driver classification (categorical) over the time period\u003c/li\u003e\n\u003cli\u003e1 = Permanent agriculture\u003c/li\u003e\n\u003cli\u003e2 = Hard commodities\u003c/li\u003e\n\u003cli\u003e3 = Shifting cultivation\u003c/li\u003e\n\u003cli\u003e4 = Logging\u003c/li\u003e\n\u003cli\u003e5 = Wildfire\u003c/li\u003e\n\u003cli\u003e6 = Settlements and infrastructure\u003c/li\u003e\n\u003cli\u003e7 = Other natural disturbances\u003c/li\u003e\n\u003cli\u003eBand 2: Permanent agriculture - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 3: Hard commodities - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 4: Shifting cultivation - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 5: Logging - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 6: Wildfire - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 7: Settlements and infrastructure - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003cli\u003eBand 8: Other natural disturbances - probability percentage (numeric) scaled over [0-250]\u003c/li\u003e\n\u003c/ul\u003e",
        "num_resources": 2,
        "num_tags": 1,
        "open_in": "[]",
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Global map of the dominant driver of tree cover loss at 0.01° resolution (~1km) for the period 2001-2022. This specific version is the data associated with an original peer reviewed research paper released in 2025.",
        "spatial_address": "Global",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://doi.org/10.1088/1748-9326/add606",
        "title": "Global drivers of forest loss at 1 km resolution - Version 1.0",
        "type": "dataset",
        "update_frequency": "annually",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data related to tree cover, deforestation, reforestation, and forest biodiversity.",
                "display_name": "Forests",
                "id": "c74fae7a-9b54-4c02-b7b5-e3ca00bff8ef",
                "image_display_url": "",
                "name": "forests",
                "title": "Forests",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-21T14:26:46.155112",
                "datastore_active": False,
                "description": "Version 1.0 available as a web map layer.",
                "format": "Layer",
                "hash": "",
                "id": "28fb0d09-61cf-456f-b267-5a71d95a218f",
                "last_modified": None,
                "metadata_modified": "2025-05-21T14:26:55.190346",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Dominant Driver Map Layer",
                "package_id": "5162a96b-80e0-4824-8bff-cac37b27cd5f",
                "position": 0,
                "resource_type": None,
                "rw_id": "b7d527e4-d322-41c8-81ea-cd6056fed21d",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/07c6eb93-12d4-4d80-9d55-de1b6410222f/layer/b7d527e4-d322-41c8-81ea-cd6056fed21d",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-05-21T14:26:55.205144",
                "datastore_active": False,
                "description": "Version 1.0 (2001-2022). Raster file in EPSG:4326 (WGS84) coordinate system at 0.01° resolution. See dataset description for how to interpret the 8 raster bands.",
                "format": "tif",
                "hash": "",
                "id": "e1c9dfd2-b2f6-4e24-b479-59c0f5b5be32",
                "last_modified": "2025-05-21T14:26:55.006741",
                "metadata_modified": "2025-05-21T14:26:55.192309",
                "mimetype": "image/tiff",
                "mimetype_inner": None,
                "name": "Cloud Optimized Geotiff - v1.0",
                "package_id": "5162a96b-80e0-4824-8bff-cac37b27cd5f",
                "position": 1,
                "resource_type": None,
                "size": 281293280,
                "state": "active",
                "title": "Cloud Optimized Geotiff - v1.0",
                "url": "http://localhost:8998/files/drivers_forest_loss_1km_2001_2022_v1.tif",
                "url_type": "upload",
            },
        ],
        "tags": [
            {
                "display_name": "raster",
                "id": "36f3d667-e68f-402e-86d3-0fe96419476f",
                "name": "raster",
                "state": "active",
                "vocabulary_id": None,
            }
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Leah Lazer", "email": None},
            {"name": "Lydia Freehafer", "email": None},
            {"name": "Brian Zepka", "email": "brian.zepka@wri.org"},
        ],
        "cautions": "\u003cp\u003eThis dataset is the result of new data collection by WRI’s Electric School Bus Initiative, and is sourced from hundreds of news articles, school district webpages, and other online sources.\nTo the best of our knowledge, these data are up to date as of the time described in documentation packaged with each version.\nThe data represent a snapshot in time, in a rapidly evolving space.\u003c/p\u003e",
        "citation": "Lazer, L., L. Freehafer, and B. Zepka. September 2024. Dataset of Electric School Bus Adoption in the United States. Version 8. World Resources Institute. Accessed through https://datasets.wri.org/dataset/electric-school-bus-adoption on \u003cdate\u003e",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "",
        "has_chart_views": False,
        "id": "82697e64-e223-405f-a1c0-4d882f61384a",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://www.wri.org/insights/where-electric-school-buses-us",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {
                "name": "Electric School Bus Initiative",
                "email": "esbinfo@wri.org",
            }
        ],
        "metadata_created": "2025-01-29T15:32:05.846759",
        "metadata_modified": "2025-01-29T15:32:25.898141",
        "methodology": "\u003cp\u003eESB-related data were collected from a variety of publicly available sources, including news articles, school websites, industry publications like School Bus Fleet magazine, and social media posts.\nOther demographic and economic data come from reputable, public datasets including the Environmental Protection Agency (EPA), U.S. Census, and National Center for Education Statistics.\u003c/p\u003e",
        "name": "electric-school-bus-adoption",
        "notes": '\u003cp\u003eTransitioning to electric school buses (ESBs) from traditional diesel-powered school buses can reduce students’ exposure to air pollution and decrease greenhouse gas emissions.\nSchool districts and private fleet operators around the United States are adopting electric school buses with increasing speed, but so far ESB adoption has not been tracked or reported in a centralized and publicly accessible way.\nWRI aims to create and disseminate sound, up-to-date, accessible data and analyses that can help school district staff, advocates, policymakers, and other stakeholders make evidence-based decisions and support the transition to electric school buses.\nThis first-of-its-kind dataset that tracks ESB adoption across the United States.\u003c/p\u003e\n\u003cp\u003eThe dataset is organized by both school district and individual ESB and tracks the number of "committed" ESBs.\nAn ESB is considered "committed" starting from the point when a school district or fleet operator has been awarded funding to purchase it or has made formal agreement to purchase it from a manufacturer or dealer.\nWe would not consider an ESB "committed" if a school district or other fleet operator only expressed interest in ESBs or stated that they plan to acquire ESBs, without awarded funding or an agreement with a third party.\nThe dataset also tracks the progress of each individual ESB through the four phases of the adoption process: "awarded", "ordered", "delivered", and "operating".\nIt also contains school district characteristics including poverty, racial composition, air pollution, and locale (urban, suburban, town, or rural), to enable wider analysis of the adoption of ESBs, including the extent to which the transition to ESBs is happening equitably.\u003c/p\u003e',
        "num_resources": 1,
        "num_tags": 2,
        "open_in": '[{"title":"Electric School Bus Initiative Dashboard","url":"https://electricschoolbusinitiative.org/electric-school-bus-data-dashboard"}]',
        "organization": {
            "id": "164c340b-5cf2-49da-98f9-024fdb7e0e42",
            "name": "electric-school-bus-initiative",
            "title": "Electric School Bus Initiative",
            "type": "organization",
            "description": "WRI's Electric School Bus Initiative accelerates the adoption of electric school buses to deliver on improved health and environmental outcomes in communities across the United States of America.",
            "image_url": "students-boarding-school-bus-m3277f.jpg",
            "created": "2024-09-24T18:14:31.852003",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "164c340b-5cf2-49da-98f9-024fdb7e0e42",
        "private": False,
        "rw_dataset": False,
        "short_description": 'This dataset tracks electric school bus (ESB) adoption across the United States. It tracks the number of "committed" ESBs at the school district level, as well as details about individual buses, including the bus manufacturer and funding source(s). It also tracks when each ESB passed through the phases of the adoption process and the current phase of each bus. The dataset contains school district socio-economic characteristics, like poverty rates, racial composition and air pollution to enable wider analysis including whether the transition to ESBs is happening equitably.',
        "spatial_address": "United States",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://www.wri.org/research/technical-note-dataset-electric-school-bus-adoption-united-states",
        "title": "Dataset of Electric School Bus Adoption in the United States",
        "type": "dataset",
        "update_frequency": "biannually",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data concerning urban spaces and systems.",
                "display_name": "Cities",
                "id": "80539133-5aaa-4257-9aeb-fe6f56e2837f",
                "image_display_url": "https://datasets.wri.org/private-admin/uploads/group/children-biking-calle-colombia-2-qy6gqa.jpeg",
                "name": "cities",
                "title": "Cities",
                "type": "group",
            },
            {
                "description": "Data concerning transportation systems including public and private transit.",
                "display_name": "Mobility",
                "id": "4926571e-a4e5-403d-8278-31a570039cc3",
                "image_display_url": "",
                "name": "mobility",
                "title": "Mobility",
                "type": "group",
            },
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2025-01-29T15:32:07.224262",
                "datastore_active": False,
                "description": "Released 2022-January (data through 2021-December)",
                "format": "ZIP",
                "hash": "",
                "id": "7e1e6462-789a-4536-ad61-1eae97c71f64",
                "last_modified": "2025-01-29T15:32:07.050176",
                "metadata_modified": "2025-01-29T15:32:09.053451",
                "mimetype": "application/zip",
                "mimetype_inner": None,
                "name": "Electric School Bus Adoption Version 1",
                "package_id": "82697e64-e223-405f-a1c0-4d882f61384a",
                "position": 0,
                "resource_type": None,
                "size": 9116566,
                "state": "active",
                "title": "Electric School Bus Adoption Version 1",
                "url": "http://localhost:8998/files/electric_school_bus_adoption_dataset_v1_2022-01jan.zip",
                "url_type": "upload",
            },
        ],
        "tags": [
            {
                "display_name": "education",
                "id": "98308223-4dfa-43b1-8de6-742cc5c54997",
                "name": "education",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "electric vehicles",
                "id": "2e6e58ab-8c21-4f4f-ba68-48c6a5183efd",
                "name": "electric vehicles",
                "state": "active",
                "vocabulary_id": None,
            },
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Elise Mazur", "email": "elise.mazur@wri.org"},
            {"name": "Michelle Sims", "email": "michelle.sims@wri.org"},
            {"name": "... and others", "email": None},
        ],
        "cautions": '\u003cul\u003e\n\u003cli\u003eA conservative approach to mapping natural lands results in overestimation of natural lands in some regions.\u003c/li\u003e\n\u003cli\u003eIt is recommended that this map only be used for purposes that align with the definitions of "natural" used in the map such as setting a corporate "no conversion of natural ecosystems" target associated with SBTN Land.\u003c/li\u003e\n\u003cli\u003eIt is \u003cstrong\u003enot recommended\u003c/strong\u003e to use this map data to quantify the area or proportion of natural or non-natural lands within any spatial region.\u003c/li\u003e\n\u003cli\u003eThis data concerns a single time slice circa 2020 and does not contain time-series data that may be useful for monitoring conversion.\u003c/li\u003e\n\u003cli\u003eThis data incorporates regional data with global data and therefore is not globally consistent. If comparing across geographies, refer to the figures and tables in the technical note identifying where regional data was used. \u003c/li\u003e\n\u003cli\u003eThe definitions of "natural" used in the map does not consider or define attributes such as importance of land for biodiversity or the quality of ecosystems.\u003c/li\u003e\n\u003c/ul\u003e',
        "citation": 'Mazur, E., M. Sims, E. Goldman, M. Schneider, M.D. Pirri, C.R. Beatty, F. Stolle, Stevenson, M. 2024. "SBTN Natural Lands Map v1: Technical Documentation". Science Based Targets for Land Version 1-- Supplementary Material. Science Based Targets Network. https://sciencebasedtargetsnetwork.org/wp-content/uploads/2024/09/Technical-Guidance-2024-Step3-Land-v1-Natural-Lands-Map.pdf',
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": 'This dataset is intended to be used in the Science Based Targets Network target on "no conversion of natural ecosystems."',
        "has_chart_views": False,
        "id": "80b8f4f3-cedb-4893-87b8-9e3ec4a40c33",
        "is_approved": True,
        "isopen": False,
        "language": "en",
        "learn_more": "https://sciencebasedtargetsnetwork.org/companies/take-action/set-targets/land-targets/",
        "license_id": "other-nc",
        "license_title": "Other (Non-Commercial)",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "Elise Mazur", "email": "elise.mazur@wri.org"}
        ],
        "metadata_created": "2024-12-18T18:37:34.596051",
        "metadata_modified": "2024-12-18T18:37:34.596056",
        "methodology": '\u003cp\u003eAll data processing is performed through Google Earth Engine and written in Javascript.\nThe scripts are available on GitHub: \u003ca href="https://github.com/wri/natural-lands-map"\u003ehttps://github.com/wri/natural-lands-map\u003c/a\u003e.\nThe full processing methodology is detailed in the SBTN technical documentation.\u003c/p\u003e\n\u003cp\u003eTo briefly describe the methodology to classify areas:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eClassification into natural and non-natural areas through a decision tree relied on both global and regional land use and land cover maps such as those generated by the University of Maryland (Global Land Use and Land Cover Change) and the European Space Agency (WorldCover) and others.\u003c/li\u003e\n\u003cli\u003eIndividual land classes are modified by spatial intersection, union, and differencing with global input data that has a focused scope such as known plantations (Spatial Database of Planted Trees v2) and crop maps (USGS GCEP30, WorldCereal)\u003c/li\u003e\n\u003cli\u003eNatural forests and short vegetation have 0.5-hectare minimum mapping units applied to meet definitions and remove "noise."\u003c/li\u003e\n\u003cli\u003eRegional data superseded global data where available. Some reclassification of regional datasets were applied to improve consistency with the definitions used across datasets.\u003c/li\u003e\n\u003c/ul\u003e',
        "name": "sbtn-natural-lands-map",
        "notes": '\u003cp\u003eThe SBTN Natural Lands Map is intended to be used in corporate target setting and evaluation that is aligned with the Science Based Targets Network (SBTN) framework.\nSBTN\'s Land Hub has developed version 1 of its voluntary corporate target setting methodology and a key target is "no conversion of natural ecosystems."\nThis map enables companies and their stakeholders to estimate their natural land conversion by comparing this 2020 baseline to their current resource sourcing locations.\u003c/p\u003e\n\u003cp\u003eThe SBTN Natural Lands Map has a two-tier categorization system.\nThe first tier makes a binary disinction between "natural" and "non-natural" areas according to a very specific definition of natural ecosystems and land.\nThe second tier further refines the binary "natural or not" map with context about land use and land cover to provide 20 classes such as "natural forest", "non-natural tree cover", and "non-natural cropland".\u003c/p\u003e\n\u003cp\u003eThe map relies on over 20 datasets that have either global or regional coverage.\nEach dataset or class-dependent subsets of each dataset is utilized within an objective decision tree that results in per-pixel classification.\nThe map is produced with global coverage and 30-meter resolution reflecting the properties of some critical input data.\u003c/p\u003e\n\u003cp\u003eThe data is available for access and analysis within \u003ca href="https://developers.google.com/earth-engine/datasets/catalog/WRI_SBTN_naturalLands_v1#description"\u003eGoogle Earth Engine\u003c/a\u003e.\u003c/p\u003e\n\u003cp\u003eThe following land classes are available in the second tier of classification:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eNatural - Forest\u003c/li\u003e\n\u003cli\u003eNatural - Short vegetation\u003c/li\u003e\n\u003cli\u003eNatural - Water\u003c/li\u003e\n\u003cli\u003eNatural - Mangroves\u003c/li\u003e\n\u003cli\u003eNatural - Bare\u003c/li\u003e\n\u003cli\u003eNatural - Snow/Ice\u003c/li\u003e\n\u003cli\u003eNatural - Wetland forest\u003c/li\u003e\n\u003cli\u003eNatural - Peat forest\u003c/li\u003e\n\u003cli\u003eNatural - Wetland short vegetation\u003c/li\u003e\n\u003cli\u003eNatural - Peat short vegetation\u003c/li\u003e\n\u003cli\u003eNon-natural - Cropland\u003c/li\u003e\n\u003cli\u003eNon-natural - Built-up\u003c/li\u003e\n\u003cli\u003eNon-natural - Tree cover\u003c/li\u003e\n\u003cli\u003eNon-natural - Short vegetation\u003c/li\u003e\n\u003cli\u003eNon-natural - Water\u003c/li\u003e\n\u003cli\u003eNon-natural - Wetland tree cover\u003c/li\u003e\n\u003cli\u003eNon-natural - Peat tree cover\u003c/li\u003e\n\u003cli\u003eNon-natural - Wetland short vegetation\u003c/li\u003e\n\u003cli\u003eNon-natural - Peat short vegetation\u003c/li\u003e\n\u003c/ul\u003e',
        "num_resources": 2,
        "num_tags": 2,
        "open_in": '[{"title":"Google Earth Engine Application","url":"https://wri-datalab.earthengine.app/view/sbtn-natural-lands"},{"title":"Google Earth Engine Data Catalog","url":"https://developers.google.com/earth-engine/datasets/catalog/WRI_SBTN_naturalLands_v1#description"}]',
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": 'Natural Lands as defined for the Science Based Targets Network (SBTN) target on "no conversion of natural ecosystems."',
        "spatial_address": "Global",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://sciencebasedtargetsnetwork.org/wp-content/uploads/2024/09/Technical-Guidance-2024-Step3-Land-v1-Natural-Lands-Map.pdf",
        "title": "SBTN Natural Lands Map",
        "type": "dataset",
        "update_frequency": "not_planned",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data concerning land use, land cover, and terrestrial ecosystem dynamics along with the human and environmental drivers of our food, forests, and water systems.",
                "display_name": "Land",
                "id": "c1427a08-9de5-4182-9c05-b6a61fda3127",
                "image_display_url": "https://datasets.wri.org/private-admin/uploads/group/land-peru-amazon-river-jrjo7f.jpg",
                "name": "land",
                "title": "Land",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-18T18:37:34.603405",
                "datastore_active": False,
                "description": "The first tier of classification of natural land types.",
                "format": "Layer",
                "hash": "",
                "id": "70a4be84-bfaa-471b-b86e-f186b51af393",
                "last_modified": None,
                "metadata_modified": "2024-12-18T18:37:34.586226",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "SBTN Natural Lands Map v1 (binary)",
                "package_id": "80b8f4f3-cedb-4893-87b8-9e3ec4a40c33",
                "position": 0,
                "resource_type": None,
                "rw_id": "3c722a40-85ee-4544-a850-607d49cc9b18",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/2c6e8aa3-747d-48c5-b516-285f343a463e/layer/3c722a40-85ee-4544-a850-607d49cc9b18",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-18T18:37:34.603413",
                "datastore_active": False,
                "description": "The second tier of classification of natural land types.",
                "format": "Layer",
                "hash": "",
                "id": "94588276-9ddf-4825-89ee-708701f95045",
                "last_modified": None,
                "metadata_modified": "2024-12-18T18:37:34.586373",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "SBTN Natural Lands Map v1 (classification)",
                "package_id": "80b8f4f3-cedb-4893-87b8-9e3ec4a40c33",
                "position": 1,
                "resource_type": None,
                "rw_id": "7f6a4033-e702-407f-b28c-0743d700a54b",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/2c6e8aa3-747d-48c5-b516-285f343a463e/layer/7f6a4033-e702-407f-b28c-0743d700a54b",
                "url_type": "layer-raw",
            },
        ],
        "tags": [
            {
                "display_name": "Global Commons Alliance",
                "id": "d5141253-8d56-4f36-acd6-00527e0f37cb",
                "name": "Global Commons Alliance",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Supply chains",
                "id": "18a3c7ff-52db-49fd-a11f-a22e1ae179f2",
                "name": "Supply chains",
                "state": "active",
                "vocabulary_id": None,
            },
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Jamie Tolan", "email": None},
            {"name": "... and 15 others", "email": None},
        ],
        "cautions": "\u003cul\u003e\n\u003cli\u003eThis data is based on very high resolution satellite images collected at varying times and atmospheric conditions. As a result the global map does not represent a snapshot in time. Auxiliary files available on AWS include imagery details.\u003c/li\u003e\n\u003cli\u003eThe machine learning model producing this data is trained and validated on a limited geographic range. Continued comparison and validation is needed to assess and contextualize errors and uncertainties in the estimates across all geographies and input imagery conditions.\u003c/li\u003e\n\u003cli\u003eField validation for very tall trees (&gt;25 meters) was not performed during the development of this dataset. This may affect derivatives of the data such as above ground carbon estimates.\u003c/li\u003e\n\u003cli\u003eTerrain slope may influence canopy height estimates by way of modifying the length of a shadow versus totally flat ground. The machine learning model may produce estimates with systematic bias in areas depending on the properties of the surrounding terrain.\u003c/li\u003e\n\u003c/ul\u003e",
        "citation": "Tolan, J., Yang, H., Nosarzewski B., et al. (2024). Very high resolution canopy height maps from RGB imagery using self-supervised vision transformer and convolutional decoder trained on aerial lidar, Remote Sensing of Environment. https://doi.org/10.1016/j.rse.2023.113888",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Canopy height maps provide spatial information about the elevation difference between the top of tree or other vegetative canopy and the ground underneath the canopy. Such information can be an input to estimates of biomass and carbon stocks.",
        "has_chart_views": False,
        "id": "3f3d5dc4-d1db-4fa4-b3cd-3d55136ada23",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://sustainability.atmeta.com/blog/2024/04/22/using-artificial-intelligence-to-map-the-earths-forests/",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "John Brandt", "email": "john.brandt@wri.org"}
        ],
        "metadata_created": "2024-12-17T19:28:58.980622",
        "metadata_modified": "2024-12-17T19:28:58.980627",
        "methodology": '\u003cp\u003eThis dataset was created by machine learning analysis of 0.5 meter WorldView imagery from Maxar as released via their Vivid Basemap layer.\nThe underlying imagery spans nearly 600-thousand individual images across multiple years, with 80% of imagery being acquired between 2018 and 2020.\nTo estimate canopy height from the high resolution optical data a machine learning model was developed to relate the optical imagery to reference LiDAR data.\nBecause LiDAR data is expensive to acquire a self-supervised approach known as DiNOv2 was utilized to build high quality and global scale feature representations of the input imagery.\nA secondary model, called a dense prediction transformer, was then trained to relate the feature representations to 1-meter aerial Lidar data.\u003c/p\u003e\n\u003cp\u003eThe machine learning model weights and inference code is available on GitHub: \u003ca href="https://github.com/facebookresearch/HighResCanopyHeight/"\u003ehttps://github.com/facebookresearch/HighResCanopyHeight/\u003c/a\u003e.\u003c/p\u003e',
        "name": "meta-tree-canopy-height",
        "notes": '\u003cp\u003eThis dataset contains estimates of the vertical distance between the ground and the tops of vegetative canopy for all land globally.\nThe canopy height map has sub-meter spatial resolution reflecting the very high resolution Maxar imagery that is used as input to the height estimations.\u003c/p\u003e\n\u003cp\u003eThe data is currently available in two open access locations - Google Earth Engine and an Amazon Web Services S3.\nThe dataset is in the range of 60 terabytes (TB) so it is suggested to access the data through one of these existing channels rather than obtain a full local copy of the dataset for your own use.\u003c/p\u003e\n\u003cp\u003eIn Google Earth Engine the dataset is available under the ImageCollection "projects/meta-forest-monitoring-okw37/assets/CanopyHeight".\nThe dataset is also described in the Google Earth Engine Community Catalog: \u003ca href="https://gee-community-catalog.org/projects/meta_trees/"\u003ehttps://gee-community-catalog.org/projects/meta_trees/\u003c/a\u003e\u003c/p\u003e\n\u003cp\u003eIn AWS the dataset is available as approximately 55-thousand square image tiles that are around 80 km per side near the equator.\nA third-party R module called "chmloader" exists to support the fetching and mosaicing of the GeoTIFF tiles provided by Meta on AWS.\nThis is one recommended approach to acquiring local copies of subsets of the data.\nPlease be aware this module was not developed by the authors of this dataset and users should inspect and understand the software prior to use.\nThe R module is available on GitHub: \u003ca href="https://github.com/TESS-Laboratory/chmloader"\u003ehttps://github.com/TESS-Laboratory/chmloader\u003c/a\u003e\u003c/p\u003e',
        "num_resources": 2,
        "num_tags": 4,
        "open_in": '[{"title":"Google Earth Engine Application","url":"https://meta-forest-monitoring-okw37.projects.earthengine.app/view/canopyheight"}]',
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Global sub-meter canopy height maps from a machine learning model trained on aerial LiDAR and RGB imagery and applied to very high resolution satellite imagery.",
        "spatial_address": "Global",
        "spatial_type": "address",
        "state": "active",
        "technical_notes": "https://doi.org/10.1016/j.rse.2023.113888",
        "title": "High Resolution Canopy Height Map",
        "type": "dataset",
        "update_frequency": "not_planned",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data concerning land use, land cover, and terrestrial ecosystem dynamics along with the human and environmental drivers of our food, forests, and water systems.",
                "display_name": "Land",
                "id": "c1427a08-9de5-4182-9c05-b6a61fda3127",
                "image_display_url": "https://datasets.wri.org/private-admin/uploads/group/land-peru-amazon-river-jrjo7f.jpg",
                "name": "land",
                "title": "Land",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-17T19:28:58.990434",
                "datastore_active": False,
                "description": "",
                "format": "Layer",
                "hash": "",
                "id": "ccfb0944-de45-4ea0-9438-c264af07f960",
                "last_modified": None,
                "metadata_modified": "2024-12-17T19:28:58.958026",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Canopy Height Map",
                "package_id": "3f3d5dc4-d1db-4fa4-b3cd-3d55136ada23",
                "position": 0,
                "resource_type": None,
                "rw_id": "ad6b562f-da7b-4707-963d-a7fdac92cd2e",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/75e4feaa-8396-4f97-b48c-caf524a1af98/layer/ad6b562f-da7b-4707-963d-a7fdac92cd2e",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-17T19:28:58.990438",
                "datastore_active": False,
                "description": "The data is available from Meta through the Registry of Open Data on AWS.",
                "format": "",
                "hash": "",
                "id": "3a3c429a-0536-430b-9680-02ba89cd9ff5",
                "last_modified": None,
                "metadata_modified": "2024-12-17T19:28:58.958223",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "AWS Open Data Registry",
                "package_id": "3f3d5dc4-d1db-4fa4-b3cd-3d55136ada23",
                "position": 1,
                "resource_type": None,
                "size": None,
                "spatial_address": None,
                "spatial_coordinates": None,
                "spatial_geom": None,
                "spatial_type": None,
                "state": "active",
                "title": "AWS Open Data Registry",
                "url": "https://registry.opendata.aws/dataforgood-fb-forests/",
                "url_type": "link",
            },
        ],
        "tags": [
            {
                "display_name": "Digital surface model",
                "id": "5fd9b897-5038-49a6-b656-d4d569e43fa1",
                "name": "Digital surface model",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Machine learning",
                "id": "bd190ecb-cb0f-4c96-bfd3-0c0b33d99e91",
                "name": "Machine learning",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Raster",
                "id": "02c5322e-f55b-4f58-b473-3f7cf2356a8d",
                "name": "Raster",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Trees",
                "id": "4d85cc9f-5c79-4576-be65-00689a2cc336",
                "name": "Trees",
                "state": "active",
                "vocabulary_id": None,
            },
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {
                "name": "Leandro Parente",
                "email": "leandro.parente@opengeohub.org",
            },
            {"name": "Lindsey Sloat", "email": "lindsey.sloat@wri.org"},
            {"name": "... and 18 others", "email": None},
        ],
        "cautions": "\u003cul\u003e\n\u003cli\u003eMany areas of the world are predicted to be cultivated grassland but are actually cropland or some other cyclical short vegetation land cover. The peer-reviewed publication should be consulted for known defects and geographic contextualization including regions of under or over-prediction for certain classes.\u003c/li\u003e\n\u003cli\u003eThe primary data products are two grassland class probability maps. The dominant grassland class map is based on balanced probability thresholds for each map which results in maps that likely have a conservative estimate for total grassland worldwide.\u003c/li\u003e\n\u003cli\u003eThe dominant grassland class maps preferentially select for the natural/semi-natural class over the cultivated class when the probability threshold for each is achieved. This is in part because the natural/semi-natural classification model had higher accuracy.\u003c/li\u003e\n\u003c/ul\u003e",
        "citation": "Parente, L., Sloat, L., Mesquita, V., et al. (2024). Annual 30-m maps of global grassland class and extent (2000–2022) based on spatiotemporal Machine Learning, Scientific Data. http://doi.org/10.1038/s41597-024-04139-6",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Probabalistic classification and time series to support tracking the intensity and drivers of conversion of land to cultivated grasslands and from natural / semi-natural grasslands into other land use systems.",
        "has_chart_views": False,
        "id": "ab526ddc-3954-438a-9a04-2fbb057fa53c",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://landcarbonlab.org/insights/first-global-annual-cultivated-natural-grassland-data",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            }
        ],
        "metadata_created": "2024-12-16T18:21:53.206593",
        "metadata_modified": "2024-12-16T18:21:53.206598",
        "methodology": '\u003cp\u003eThese maps are produced through a complex data pipeline that uses satellite remote sensing products and labeled training data as critical inputs.\nOver \u003ca href="/datasets/grassland-dynamics-training-labels"\u003e2.3-million reference samples\u003c/a\u003e have been collected using very high resolution imagery and combined with the bi-monthly Landsat ARD2 collection, long-term MODIS temperature and water vapor data, geometric temperature data, global terrain and elevation data, and maps of distance to key land structures such as roads and waterways.\nThe reference labels and Earth observation data are used for the training of spatiotemporal machine learning models with one model per land cover class.\nThese models are applied in a prediction step to create probabalistic estimates of land cover which are then balanced and harmonized to produce maps of the dominant grassland class.\u003c/p\u003e\n\u003cp\u003eThe full methodology is detailed in the manuscript and should be consulted to best understand specific definitions used in this data product.\u003c/p\u003e\n\u003cp\u003eThe software supporting the machine learning model development and inference is available on GitHub: \u003ca href="https://github.com/wri/global-pasture-watch"\u003ehttps://github.com/wri/global-pasture-watch\u003c/a\u003e.\u003c/p\u003e',
        "name": "grassland-dynamics",
        "notes": '\u003cp\u003eThis product maps global grassland dynamics annually for 2000-2022 at 30 m spatial resolution.\nThe dataset showing the spatiotemporal distribution of cultivated and natural/semi-natural grassland classes was produced by using bi-monthly aggregates of GLAD Landsat ARD-2 image archive, accompanied by climatic, landform and proximity covariates, spatiotemporal machine learning (per-class random forest) and over \u003ca href="/datasets/grassland-dynamics-training-labels"\u003e2.3-million reference samples\u003c/a\u003e visually interpreted in very high resolution imagery.\nThe suggested uses of data include (1) integration with other compatible land cover products and (2) tracking the intensity and drivers of conversion of land to cultivated grasslands and from natural / semi-natural grasslands into other land use systems.\u003c/p\u003e\n\u003cp\u003eThe mapped grassland extent includes any land cover type which contains at least 30% of dry or wet low vegetation dominated by grasses and forbs (less than 3 meters) and a:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003emaximum of 50% tree canopy cover (greater than 5 meters),\u003c/li\u003e\n\u003cli\u003emaximum of 70% of other woody vegetation (scrubs and open shrubland), and\u003c/li\u003e\n\u003cli\u003emaximum of 50% active cropland cover in mosaic landscapes of cropland &amp; other vegetation.\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThe grassland extent is classified into two classes:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003e\u003cstrong\u003eCultivated grassland\u003c/strong\u003e: Areas where grasses and other forage plants have been intentionally planted and managed, as well as areas of native grassland-type vegetation where they clearly exhibit active and \'heavy\' management for specific human-directed uses, such as directed grazing of livestock.\u003c/li\u003e\n\u003cli\u003e\u003cstrong\u003eNatural/semi-natural grassland\u003c/strong\u003e: Relatively undisturbed native grasslands/short-height vegetation, such as steppes and tundra, as well as areas that have experienced varying degrees of human activity in the past, which may contain a mix of native and introduced species due to historical land use and natural processes. In general, they exhibit natural-looking patterns of varied vegetation and clearly ordered hydrological relationships throughout the landscape.\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThe dataset is organized in 69 global mosaics (23 years for each time series) in COG (Cloud Optimized GeoTIFF) format, WGS84 Coordinate Systems (EPSG:4326) and pixel size equal to 0.00025 degrees, including:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003eprobabilities of cultivated grassland (values range from 0–100),\u003c/li\u003e\n\u003cli\u003eprobabilities of natural/semi-natural grassland (values range from 0–100), and\u003c/li\u003e\n\u003cli\u003edominant class (other land cover, cultivated grassland, or natural/semi-natural grassland).\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eThese COGs are available in the OpenLandMap STAC: \u003ca href="https://stac.openlandmap.org/gpw_ggc-30m/collection.json"\u003ehttps://stac.openlandmap.org/gpw_ggc-30m/collection.json\u003c/a\u003e\u003c/p\u003e\n\u003cp\u003eThe data is available for visualization and analysis within Google Earth Engine by using the following ImageCollections:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003e\u003ca href="https://developers.google.com/earth-engine/datasets/catalog/projects_global-pasture-watch_assets_ggc-30m_v1_grassland_c"\u003eprojects/global-pasture-watch/assets/ggc-30m/v1/grassland_c\u003c/a\u003e\u003c/li\u003e\n\u003cli\u003e\u003ca href="https://developers.google.com/earth-engine/datasets/catalog/projects_global-pasture-watch_assets_ggc-30m_v1_cultiv-grassland_p"\u003eprojects/global-pasture-watch/assets/ggc-30m/v1/cultiv-grassland_p\u003c/a\u003e\u003c/li\u003e\n\u003cli\u003e\u003ca href="https://developers.google.com/earth-engine/datasets/catalog/projects_global-pasture-watch_assets_ggc-30m_v1_nat-semi-grassland_p"\u003eprojects/global-pasture-watch/assets/ggc-30m/v1/nat-semi-grassland_p\u003c/a\u003e\u003c/li\u003e\n\u003c/ul\u003e\n\u003cp\u003eA Google Earth Engine Application is also available for inspecting the data and investigating custom probability thresholds for class selection: \u003ca href="https://global-pasture-watch.projects.earthengine.app/view/ggc-30m"\u003ehttps://global-pasture-watch.projects.earthengine.app/view/ggc-30m\u003c/a\u003e.\u003c/p\u003e\n\u003cp\u003eThe grassland dynamics maps are created by the Global Pasture Watch (GPW) research consortium initiated by the Land &amp; Carbon Lab.\nGPW consists of experts from the World Resources Institute (WRI), OpenGeoHub Foundation, the Image Processing and GIS Laboratory at the Federal University of Goiás (LAPIG/UFG), the International Institute for Applied Systems Analysis (IIASA), the German Center for Integrative Biodiversity Research (iDiv), Cornell University; and the Global Land Analysis and Discovery laboratory of the University of Maryland (GLAD).\u003c/p\u003e',
        "num_resources": 4,
        "num_tags": 3,
        "open_in": '[{"title":"Google Earth Engine","url":"https://developers.google.com/earth-engine/datasets/publisher/global-pasture-watch"}]',
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Global maps of grassland class created from satellite imagery with 30-meter spatial resolution and annual temporal resolution.",
        "spatial_address": "Global",
        "state": "active",
        "technical_notes": "https://doi.org/10.1038/s41597-024-04139-6",
        "title": "Annual 30-m maps of global grassland class and extent (2000–2022)",
        "type": "dataset",
        "update_frequency": "not_planned",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data concerning land use, land cover, and terrestrial ecosystem dynamics along with the human and environmental drivers of our food, forests, and water systems.",
                "display_name": "Land",
                "id": "c1427a08-9de5-4182-9c05-b6a61fda3127",
                "image_display_url": "https://datasets.wri.org/private-admin/uploads/group/land-peru-amazon-river-jrjo7f.jpg",
                "name": "land",
                "title": "Land",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-16T18:21:53.213844",
                "datastore_active": False,
                "description": "Global raster with 3 classes - other land cover (0), cultivated (1), or natural/semi-natural grassland (2) based on balanced and harmonized thresholds for the grassland class probabilities.",
                "format": "Layer",
                "hash": "",
                "id": "16af6998-0343-4ea0-b2f0-a7d6424ba823",
                "last_modified": None,
                "metadata_modified": "2024-12-16T18:21:53.186974",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Cultivated and natural/semi-natural grassland map",
                "package_id": "ab526ddc-3954-438a-9a04-2fbb057fa53c",
                "position": 0,
                "resource_type": None,
                "rw_id": "8656f38d-f826-4660-b83f-f5c3eedbd430",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/f127ef4d-91ae-4398-b4d7-57a157b31990/layer/8656f38d-f826-4660-b83f-f5c3eedbd430",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-16T18:21:53.213852",
                "datastore_active": False,
                "description": "Probability between 0% and 100% that the land is natural/semi-natural grassland or pasture.",
                "format": "Layer",
                "hash": "",
                "id": "32417676-ff67-4113-8cf2-67d142227914",
                "last_modified": None,
                "metadata_modified": "2024-12-16T18:21:53.187217",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Natural/semi-natural probability",
                "package_id": "ab526ddc-3954-438a-9a04-2fbb057fa53c",
                "position": 1,
                "resource_type": None,
                "rw_id": "31f4b063-0a43-4cde-a178-8470b514fb51",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/52ba9748-107f-4b2a-94ec-e9d5f16598ba/layer/31f4b063-0a43-4cde-a178-8470b514fb51",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-16T18:21:53.213855",
                "datastore_active": False,
                "description": "Probability between 0% and 100% that the land is cultivated grassland or pasture.",
                "format": "Layer",
                "hash": "",
                "id": "64fe432d-4546-4808-b330-6c97287d6d98",
                "last_modified": None,
                "metadata_modified": "2024-12-16T18:21:53.187347",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Cultivated probability",
                "package_id": "ab526ddc-3954-438a-9a04-2fbb057fa53c",
                "position": 2,
                "resource_type": None,
                "rw_id": "c3b7723f-e1e4-4ae2-b7af-86b0115d0dd1",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/4849f6a8-f43a-432a-96a0-aebfef74aeea/layer/c3b7723f-e1e4-4ae2-b7af-86b0115d0dd1",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-16T18:21:53.213858",
                "datastore_active": False,
                "description": "This data product has been archived with Zenodo and you are able to access the GeoTIFFs using this link.",
                "format": "",
                "hash": "",
                "id": "cac29106-e4de-4815-8ef7-8dcd421aad2e",
                "last_modified": None,
                "metadata_modified": "2024-12-16T18:21:53.187469",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Cloud Optimized GeoTIFFs (COGs)",
                "package_id": "ab526ddc-3954-438a-9a04-2fbb057fa53c",
                "position": 3,
                "resource_type": None,
                "size": None,
                "spatial_address": None,
                "spatial_coordinates": None,
                "spatial_geom": None,
                "spatial_type": None,
                "state": "active",
                "title": "Cloud Optimized GeoTIFFs (COGs)",
                "url": "https://doi.org/10.5281/zenodo.13890401",
                "url_type": "link",
            },
        ],
        "tags": [
            {
                "display_name": "Global Pasture Watch Consortium",
                "id": "230efe08-344a-463e-962c-76523382326a",
                "name": "Global Pasture Watch Consortium",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Raster",
                "id": "02c5322e-f55b-4f58-b473-3f7cf2356a8d",
                "name": "Raster",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "STAC",
                "id": "0ada3f2d-f22a-411c-89cd-6474ebf57cf5",
                "name": "STAC",
                "state": "active",
                "vocabulary_id": None,
            },
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Leandro Parente", "email": None},
            {"name": "Vinicius Mesquita", "email": None},
            {"name": "... and 6 others", "email": None},
        ],
        "cautions": "\u003cul\u003e\n\u003cli\u003eThis is research data collected and used for the creation of machine learning models to predict certain types of land cover. Using and building upon this data may be beneficial in the future but the fundamental collection and visual interpretation occur within a constrained question framework.\u003c/li\u003e\n\u003c/ul\u003e",
        "citation": "Parente, L., Sloat, L., Mesquita, V., et al. (2024). Annual 30-m maps of global grassland class and extent (2000–2022) based on spatiotemporal Machine Learning, Scientific Data. http://doi.org/10.1038/s41597-024-04139-6",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "Reference labels for grassland class to support machine learning model training and validation.",
        "has_chart_views": False,
        "id": "85f870b0-29cb-4f92-8f49-1fdcf2156e5b",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "https://landcarbonlab.org/insights/first-global-annual-cultivated-natural-grassland-data",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {
                "name": "Radost Stanimirova",
                "email": "radost.stanimirova@wri.org",
            }
        ],
        "metadata_created": "2024-12-11T10:53:20.039527",
        "metadata_modified": "2024-12-11T10:53:20.039536",
        "methodology": "\u003cp\u003eA Feature Space Coverage Sampling (FSCS) is used to generate reference samples and improve the representativeness of reference samples.\nUsing FSCS 10-thousand sample tiles of 1 km x 1 km are distributed across the World within areas that have short vegetation any year from 1993 to 2021.\nThe selected FSCS tiles are visually interpreted by 16 visual interpretation analysts who classify the entire tile surface into three classes (i.e. cultivated grassland, natural/semi-natural grassland, and other land cover) using Google Maps and Bing Maps imagery as reference.\nFor each tile the analysts interpreted the land class and labeled a fine grid with 10 m grid cells.\u003c/p\u003e\n\u003cp\u003eLabeling is performed with the goal of differentiating natural/semi-natural grasslands without significant human directed management from those under heavy management and/or entirely cultivated grasslands.\nThe labelling criteria focused only on these two end-members taking into consideration features that can be objectively identified in very high resolution imagery.\u003c/p\u003e\n\u003cp\u003eThe full methodology is detailed in the manuscript and should be consulted to best understand specific definitions and conventions used in this data product.\u003c/p\u003e",
        "name": "grassland-dynamics-training-labels",
        "notes": '\u003cp\u003eThis dataset supports the original research and publication behind the \u003ca href="/datasets/grassland-dynamics"\u003eannual grassland data product\u003c/a\u003e with 30-meter resolution.\nThe labeled reference data includes over 2.3-million visual interpretations within very high resolution images.\nTwo independent spatiotemporal machine learning models were trained to predict each grassland class (i.e. cultivated grassland and natural/semi-natural grassland) over multiple years on a global scale.\u003c/p\u003e\n\u003cp\u003eThese data are available as GeoPackage files (.gpkg) which can be used within a visual GIS or command line tools.\nThe files include the following information:\u003c/p\u003e\n\u003cul\u003e\n\u003cli\u003ePolygon footprints of the ten-thousand sampling regions (visual interpretation units) and associated context of the intepretation\u003c/li\u003e\n\u003cli\u003eLabeled points on a 10-meter grid within each sampling region based on interpretation of grassland class using very high resolution imagery\u003c/li\u003e\n\u003cli\u003eRepresentative sample points on a 60-meter grid aggregated from the 10-meter interpretations and locally extracted independent landcover information\u003c/li\u003e\n\u003c/ul\u003e',
        "num_resources": 1,
        "num_tags": 2,
        "open_in": "[]",
        "organization": {
            "id": "ad461dbd-f646-4080-94a9-c10005c42a43",
            "name": "land-carbon-lab",
            "title": "Land & Carbon Lab",
            "type": "organization",
            "description": "WRI's Land & Carbon Lab creates datasets to support critical monitoring and decision making needs surrounding land use planning, carbon accounting, and other technical facets of human-land interactions.",
            "image_url": "1724353785-cover-ethiopia-mosaic-oqiid6.avif",
            "created": "2024-09-25T11:07:47.708772",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "ad461dbd-f646-4080-94a9-c10005c42a43",
        "private": False,
        "rw_dataset": False,
        "short_description": "Reference samples and training data for grassland classification.",
        "spatial_address": "Global",
        "state": "active",
        "technical_notes": "https://doi.org/10.1038/s41597-024-04139-6",
        "title": 'Supplementary Material for "Annual 30-m maps of global grassland class and extent (2000–2022) based on spatiotemporal Machine Learning"',
        "type": "dataset",
        "update_frequency": "not_planned",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data concerning land use, land cover, and terrestrial ecosystem dynamics along with the human and environmental drivers of our food, forests, and water systems.",
                "display_name": "Land",
                "id": "c1427a08-9de5-4182-9c05-b6a61fda3127",
                "image_display_url": "https://datasets.wri.org/private-admin/uploads/group/land-peru-amazon-river-jrjo7f.jpg",
                "name": "land",
                "title": "Land",
                "type": "group",
            }
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-12-11T10:53:20.075185",
                "datastore_active": False,
                "description": "This data product has been archived with Zenodo and you are able to access the full suite of refrence labeling data using this link.",
                "format": "",
                "hash": "",
                "id": "7f22093d-4e2f-4e11-8796-8b71f2b3513f",
                "last_modified": None,
                "metadata_modified": "2024-12-11T10:53:20.023936",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Grassland reference samples",
                "package_id": "85f870b0-29cb-4f92-8f49-1fdcf2156e5b",
                "position": 0,
                "resource_type": None,
                "size": None,
                "spatial_address": None,
                "spatial_coordinates": None,
                "spatial_geom": None,
                "spatial_type": None,
                "state": "active",
                "title": "Grassland reference samples",
                "url": "https://doi.org/10.5281/zenodo.11279264",
                "url_type": "link",
            }
        ],
        "tags": [
            {
                "display_name": "Global Pasture Watch Consortium",
                "id": "230efe08-344a-463e-962c-76523382326a",
                "name": "Global Pasture Watch Consortium",
                "state": "active",
                "vocabulary_id": None,
            },
            {
                "display_name": "Vector",
                "id": "d75507b1-50f2-445f-8a54-9f88108842c5",
                "name": "Vector",
                "state": "active",
                "vocabulary_id": None,
            },
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    },
    {
        "application": "rw",
        "approval_status": "approved",
        "author": None,
        "author_email": None,
        "authors": [
            {"name": "Logan Byers", "email": "logan.byers@wri.org"},
            {"name": "Johannes Friedrich", "email": None},
            {"name": "Roman Hennig", "email": None},
            {"name": "Aaron Kressig", "email": None},
            {"name": "Xinyue Li", "email": None},
            {"name": "Laura Malaguzzi Valeri", "email": None},
        ],
        "cautions": '\u003cp\u003eThe "Primary Fuel" is the fuel that has been identified to provide the largest portion of generated electricity for the plant or has been identified as the primary fuel by the data source.\u003c/p\u003e\n\u003cp\u003eFor power plants that have data in multiple Other Fuel fields, the ordering of the fuels should not be taken to indicate any priority or preference of the fuel for operating the power plant or generating units.\nThough the "Other Fuel" columns in the database are numbered sequentially from 1, the ordering is insignificant.\nGeneration is provided at the year scale for the years 2013-2017.\nThe generation values may correspond to a calendar year or a fiscal or regulatory year; no distinction is provided in the database.\u003c/p\u003e',
        "citation": "Global Energy Observatory, Google, KTH Royal Institute of Technology in Stockholm, Enipedia, World Resources Institute. 2021. Global Power Plant Database version 1.3.0. Accessed through https://datasets.wri.org/datasets/global-power-plant-database on \u003cdate\u003e",
        "creator_user_id": "17daa49a-aa7d-4fea-b856-d3bb9fae7cc8",
        "draft": False,
        "featured_dataset": False,
        "function": "A comprehensive, global, open source database of power plants.",
        "has_chart_views": False,
        "id": "53623dfd-3df6-4f15-a091-67457cdb571f",
        "is_approved": True,
        "isopen": True,
        "language": "en",
        "learn_more": "http://www.wri.org/publication/global-power-plant-database",
        "license_id": "cc-by",
        "license_title": "Creative Commons Attribution",
        "license_url": "http://www.opendefinition.org/licenses/cc-by",
        "maintainer": None,
        "maintainer_email": None,
        "maintainers": [
            {"name": "Logan Byers", "email": "logan.byers@wri.org"}
        ],
        "metadata_created": "2024-10-16T13:22:14.708510",
        "metadata_modified": "2024-10-16T13:22:17.339008",
        "methodology": "\u003cp\u003eThe Global Power Plant Database leverages existing data sources and methodologies to build a comprehensive and open-access power sector database.\nThe database was built entirely from open sources, which are publicly available on the internet, including data from national government agencies, reports from companies that build power plants or provide their components, data from public utilities, and information from multinational organizations.\nCurrently the Global Power Plant Database uses more than 600 sources to create the database.\u003c/p\u003e",
        "name": "global-power-plant-database",
        "notes": "\u003cp\u003eThe Global Power Plant Database is a comprehensive, open source database of power plants around the world.\nIt centralizes power plant data to make it easier to navigate, compare, and draw insights for one’s own analysis.\nThe database covers approximately 30,000 power plants from 164 countries and includes thermal plants (e.g., coal, gas, oil, nuclear, biomass, waste, geothermal) and renewables (e.g., hydro, wind, solar).\nEach power plant is geolocated, and entries contain information on plant capacity, generation, ownership, and fuel type.\u003c/p\u003e",
        "num_resources": 2,
        "num_tags": 1,
        "open_in": "[]",
        "organization": {
            "id": "afe1d718-7853-4a88-9386-cd81459f0519",
            "name": "climate-economics-finance",
            "title": "Climate, Economics, and Finance",
            "type": "organization",
            "description": "WRI's Climate, Economics, and Finance team uses research and data to inform the direction of progress on global and local greenhouse gas emissions and attempts to shift financial and governance systems towards more environmentally positive results.",
            "image_url": "unfccc-1-oo2qts.jpg",
            "created": "2024-09-25T11:07:45.706411",
            "is_organization": True,
            "approval_status": "approved",
            "state": "active",
        },
        "owner_org": "afe1d718-7853-4a88-9386-cd81459f0519",
        "private": False,
        "rw_dataset": False,
        "short_description": "A comprehensive, global, open source database of power plants.",
        "spatial_address": "Global",
        "state": "active",
        "technical_notes": "http://www.wri.org/publication/global-power-plant-database",
        "title": "Global Power Plant Database",
        "type": "dataset",
        "update_frequency": "not_planned",
        "version": None,
        "visibility_type": "public",
        "wri_data": True,
        "groups": [
            {
                "description": "Data pertaining to how economies function and the drivers of production and consumption patterns.",
                "display_name": "Economy & Industry",
                "id": "bcf5398c-4880-4678-a934-f741e1b426bc",
                "image_display_url": "http://localhost:8998/files/uploads/group/industry-woman-working-1-gcjlff.jpg",
                "name": "economy-industry",
                "title": "Economy & Industry",
                "type": "group",
            },
            {
                "description": "Data about the energy systems that underpin all economies.",
                "display_name": "Power Sector",
                "id": "a82e7d91-8c0f-429f-b145-ab7f52ea9723",
                "image_display_url": "",
                "name": "power-sector",
                "title": "Power Sector",
                "type": "group",
            },
        ],
        "resources": [
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-10-16T13:22:14.713319",
                "datastore_active": False,
                "description": "Global power plants by capacity in megawatts and fuel type. Includes coal, oil, gas, hydro, nuclear, solar, waste, wind, geothermal, and biomass.",
                "format": "Layer",
                "hash": "",
                "id": "67b08651-b6a9-4765-be71-ebca1692c5f7",
                "last_modified": None,
                "metadata_modified": "2024-10-16T13:22:15.430798",
                "mimetype": None,
                "mimetype_inner": None,
                "name": "Global Power Plant Database",
                "package_id": "53623dfd-3df6-4f15-a091-67457cdb571f",
                "position": 0,
                "resource_type": None,
                "rw_id": "2a694289-fec9-4bfe-a6d2-56c3864ec349",
                "size": None,
                "state": "active",
                "type": "layer-raw",
                "url": "https://api.resourcewatch.org/v1/dataset/a86d906d-9862-4783-9e30-cdb68cd808b8/layer/2a694289-fec9-4bfe-a6d2-56c3864ec349",
                "url_type": "layer-raw",
            },
            {
                "cache_last_updated": None,
                "cache_url": None,
                "created": "2024-10-16T13:22:15.442305",
                "datastore_active": False,
                "description": "Version 1.1.0 (June 2018)",
                "format": "ZIP",
                "hash": "",
                "id": "26669133-9493-4f38-a32f-ce35d5ea6ab9",
                "last_modified": "2024-10-16T13:22:15.388472",
                "metadata_modified": "2024-10-16T13:22:16.337146",
                "mimetype": "application/zip",
                "mimetype_inner": None,
                "name": "Version 1.1.0 (deprecated)",
                "package_id": "53623dfd-3df6-4f15-a091-67457cdb571f",
                "position": 1,
                "resource_type": None,
                "size": 1310707,
                "state": "active",
                "title": "Version 1.1.0 (deprecated)",
                "url": "http://localhost:8998/files/globalpowerplantdatabasev110.zip",
                "url_type": "upload",
            },
        ],
        "tags": [
            {
                "display_name": "powerplant",
                "id": "3ea4e1fb-c351-4077-82c3-2f609c76b328",
                "name": "powerplant",
                "state": "active",
                "vocabulary_id": None,
            }
        ],
        "relationships_as_subject": [],
        "relationships_as_object": [],
    }
]

INVALID_TAGS = [
    {
        "vocabulary_id": None,
        "display_name": "consumption%^&",
        "name": "consumption%^&",
        "revision_timestamp": "2010-08-02T09:19:47.600853",
        "state": "active",
        "id": "84ce26de-6711-4e85-9609-f7d8a87b0fc8",
    },
]

ORGS = [
    {"id": "afe1d718-7853-4a88-9386-cd81459f0519", "name": "climate-economics-finance"},
    {"id": "ad461dbd-f646-4080-94a9-c10005c42a43", "name": "land-carbon-lab"},
    {"id": "164c340b-5cf2-49da-98f9-024fdb7e0e42", "name": "electric-school-bus-initiative"}
]

GROUPS = [
    {"id": "bcf5398c-4880-4678-a934-f741e1b426bc", "name": "economy-industry"},
    {"id": "a82e7d91-8c0f-429f-b145-ab7f52ea9723", "name": "power-sector"},
    {"id": "c74fae7a-9b54-4c02-b7b5-e3ca00bff8ef", "name": "forests"},
    {"id": "80539133-5aaa-4257-9aeb-fe6f56e2837f", "name": "cities"},
    {"id": "4926571e-a4e5-403d-8278-31a570039cc3", "name": "mobility"},
    {"id": "c1427a08-9de5-4182-9c05-b6a61fda3127", "name": "land"}
]

REVISIONS = [
    {
        "id": "23daf2eb-d7ec-4d86-a844-3924acd311ea",
        "timestamp": "2015-10-21T09:50:08.160045",
        "message": "REST API: Update object dataset1",
        "author": "ross",
        "approved_timestamp": None,
        "packages": [DATASETS[1]["id"]],
        "groups": [],
    },
    {
        "id": "8254a293-10db-4af2-9dfa-6a1f06ee899c",
        "timestamp": "2015-10-21T09:46:21.198021",
        "message": "REST API: Update object dataset1",
        "author": "ross",
        "approved_timestamp": None,
        "packages": [DATASETS[1]["id"]],
        "groups": [],
    },
]
