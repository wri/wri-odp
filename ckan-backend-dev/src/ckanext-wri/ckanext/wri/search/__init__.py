import json
import logging
import os.path

from shapely import Polygon, concave_hull
import shapely.geometry
from shapely import make_valid
from shapely.wkt import loads
from shapely.geometry import MultiPolygon

from ckanext.wri.helpers.data_api import get_shape_from_dataapi

try:
    from shapely.errors import GeometryTypeError
except ImportError:
    # Previous version of shapely uses ValueError and TypeError
    GeometryTypeError = (ValueError, TypeError)

log = logging.getLogger(__name__)

def convert_multipolygon_to_polygon(multipolygon_wkt):
    multipolygon = loads(multipolygon_wkt)
    
    if isinstance(multipolygon, MultiPolygon):
        # Get the largest polygon by area
        largest_polygon = max(multipolygon, key=lambda polygon: polygon.area)
        return largest_polygon.wkt
    else:
        return multipolygon_wkt  # Return the original WKT if it's not a MultiPolygon

def _adjust_longitude(value):
    if value < -180 or value > 180:
        value = value % 360
        if value < -180:
            value = 360 + value
        elif value > 180:
            value = -360 + value
    return value


def _adjust_latitude(value):
    if value < -90 or value > 90:
        value = value % 180
        if value < -90:
            value = 180 + value
        elif value > 90:
            value = -180 + value
    return value


def fit_bbox(bbox_dict):
    """
    Ensures that all coordinates in a bounding box
    fall within -180, -90, 180, 90 degrees

    Accepts a dict with the following keys:

       {
            "minx": -4.96,
            "miny": 55.70,
            "maxx": -3.78,
            "maxy": 56.43
        }

    """

    return {
        "minx": _adjust_longitude(bbox_dict["minx"]),
        "maxx": _adjust_longitude(bbox_dict["maxx"]),
        "miny": _adjust_latitude(bbox_dict["miny"]),
        "maxy": _adjust_latitude(bbox_dict["maxy"]),
    }


def fit_point(point_dict):
    """
    Ensures that all coordinates in a point
    fall within -180, -90, 180, 90 degrees

    Accepts a dict with the following keys:

       {
            "x": -4.96,
            "y": 55.70,
        }

    """

    return {
        "x": _adjust_longitude(point_dict["x"]),
        "y": _adjust_latitude(point_dict["y"]),
    }


class SolrSpatialFieldSearchBackend:
    def parse_geojson(self, geom_from_metadata):
        try:
            geometry = json.loads(geom_from_metadata)
        except (AttributeError, ValueError) as e:
            log.error(
                "Geometry not valid JSON {}, not indexing :: {}".format(
                    e, geom_from_metadata[:100]
                )
            )
            return None

        return geometry

    def shape_from_geometry(self, geometry):
        try:
            shape = shapely.geometry.shape(geometry)
        except GeometryTypeError as e:
            log.error("{}, not indexing :: {}".format(e, json.dumps(geometry)[:100]))
            return None

        return shape

    def fit_linear_ring(self, lr):
        bbox = {
            "minx": lr[0][0],
            "maxx": lr[2][0],
            "miny": lr[0][1],
            "maxy": lr[2][1],
        }

        bbox = fit_bbox(bbox)

        return [
            (bbox["minx"], bbox["maxy"]),
            (bbox["minx"], bbox["miny"]),
            (bbox["maxx"], bbox["miny"]),
            (bbox["maxx"], bbox["maxy"]),
            (bbox["minx"], bbox["maxy"]),
        ]

    def index_dataset(self, dataset_dict):
        print("INDEXING DATASET", flush=True)
        wkt = None
        geom_from_metadata = dataset_dict.get("spatial")
        if not geom_from_metadata:
            return dataset_dict

        geometry = self.parse_geojson(geom_from_metadata)

        if not geometry:
            return dataset_dict

        # We allow multiple geometries as GeometryCollections
        if geometry["type"] == "GeometryCollection":
            geometries = geometry["geometries"]
        elif geometry["type"] == "FeatureCollection":
            geometries = list(map(lambda x: x["geometry"], geometry["features"]))
            geometry = {"type": "GeometryCollection", "geometries": geometries}
        elif geometry["type"] == "Feature":
            geometry = geometry.get("geometry")
            geometries = [geometry]
        else:
            geometries = [geometry]

        # Check potential problems with bboxes in each geometry
        wkt = []
        for geom in geometries:
            if geom["type"] == "Polygon":
                shape = self.shape_from_geometry(geom)
                wkt.append(shape.wkt)
            if (
                geom["type"] == "Polygon"
                and len(geom["coordinates"]) == 1
                and len(geom["coordinates"][0]) == 5
            ):
                # Check wrong bboxes (4 same points)
                xs = [p[0] for p in geom["coordinates"][0]]
                ys = [p[1] for p in geom["coordinates"][0]]

                if xs.count(xs[0]) == 5 and ys.count(ys[0]) == 5:
                    wkt.append("POINT({x} {y})".format(x=xs[0], y=ys[0]))
                else:
                    wkt.append(shapely.geometry.shape(geom).wkt)
                # NOTE: leaving this snippet commented here because ckanext-spatial does
                # that but it seems to be messing up some polygons
                # else:
                #     # Check if coordinates are defined counter-clockwise,
                #     # otherwise we'll get wrong results from Solr
                #     lr = shapely.geometry.polygon.LinearRing(geom["coordinates"][0])
                #     lr_coords = (
                #         list(lr.coords)
                #         if lr.is_ccw
                #         else list(reversed(list(lr.coords)))
                #     )
                #     polygon = shapely.geometry.polygon.Polygon(
                #         self.fit_linear_ring(lr_coords)
                #     )
                #     wkt.append(polygon.wkt)

        shape = self.shape_from_geometry(geometry)

        if not wkt:
            shape = shapely.geometry.shape(geometry)
            if not shape.is_valid:
                log.error("Wrong geometry, not indexing")
                return dataset_dict
            if shape.bounds[0] < -180 or shape.bounds[2] > 180:
                log.error(
                    """
Geometries outside the -180, -90, 180, 90 boundaries are not supported,
you need to split the geometry in order to fit the parts. Not indexing"""
                )
                return dataset_dict
            wkt = shape.wkt

        dataset_dict["spatial_geom"] = wkt

        return dataset_dict

    def get_point_query(self, coordinates, include_global=True, addressList=None):
        query = '_query_:"{{!field f=spatial_geom}}Contains({y}, {x})"'.format(
            **coordinates
        )
        return query

    def get_only_globals(self):
        return 'spatial_address:Global'

    def build_spatial_address_query(self, addressList, include_global=True):
        return [f"spatial_address:/.*{address}/" for address in addressList]

    def get_wkt_query(self, wkt, include_global=True):
        if include_global:
            return '_query_:"{{!field f=spatial_geom}}Intersects({})"'.format(wkt)
        return '_query_:"{{!field f=spatial_geom}}Intersects({})"'.format(wkt)
        

    def get_wkt_for_geojson(self, geojson):
        wkt = None
        geom_from_metadata = geojson

        geometry = self.parse_geojson(geom_from_metadata)

        if geometry:
            # We allow multiple geometries as GeometryCollections
            if geometry["type"] == "GeometryCollection":
                geometries = geometry["geometries"]
            elif geometry["type"] == "FeatureCollection":
                geometries = list(map(lambda x: x["geometry"], geometry["features"]))
                geometry = {"type": "GeometryCollection", "geometries": geometries}
            else:
                geometries = [geometry]

            # Check potential problems with bboxes in each geometry
            wkt = []
            for geom in geometries:
                if geom["type"] == "Polygon":
                    shape = self.shape_from_geometry(geom)
                    wkt.append(shape.wkt)
                if (
                    geom["type"] == "Polygon"
                    and len(geom["coordinates"]) == 1
                    and len(geom["coordinates"][0]) == 5
                ):
                    # Check wrong bboxes (4 same points)
                    xs = [p[0] for p in geom["coordinates"][0]]
                    ys = [p[1] for p in geom["coordinates"][0]]

                    if xs.count(xs[0]) == 5 and ys.count(ys[0]) == 5:
                        wkt.append("POINT({x} {y})".format(x=xs[0], y=ys[0]))
                    else:
                        wkt.append(shapely.geometry.shape(geom).wkt)

            shape = self.shape_from_geometry(geometry)

            if not wkt:
                shape = shapely.geometry.shape(geometry)
                wkt = shape.wkt

            return wkt

    def search_params(self, point, address, _global, search_params):

        point = fit_point(point)

        if not search_params.get("fq_list"):
            search_params["fq_list"] = []

        if _global == 'only':
            return search_params["fq_list"].append(self.get_only_globals())
        queries = []


        if isinstance(address, list):
            list_of_queries = [self.get_address_query(a, point) for a in address]
            queries += [
                i for g in list_of_queries for i in g
            ]
        else:
            queries += self.get_address_query(address, point, include_global=_global == 'include')
            
        search_params["fq_list"].append(" OR ".join(queries))

        return search_params

    def get_address_query(self, address: str, point, include_global=True):
        segments = address.split(",")
        segments = [segment.strip() for segment in segments]
        _queries = [] 
        if len(segments) in [1, 2]:
            spatial_geom = get_shape_from_dataapi(address, [point["x"], point["y"]])
            if spatial_geom:
                multipolygon = loads(spatial_geom)
                bbox = Polygon([(-180, -90), (180, -90), (180, 90), (-180, 90)])
                multipolygon = make_valid(multipolygon)
                multipolygon = multipolygon.intersection(bbox)
                polygons = [geom for geom in multipolygon.geoms if isinstance(geom, (Polygon, MultiPolygon))]
                multipolygon = MultiPolygon(polygons)
                spatial_geom = multipolygon.wkt
                _queries.append(self.get_wkt_query(spatial_geom, include_global=include_global))
                _queries = _queries + self.build_spatial_address_query(segments)
        if point:
            _queries.append(self.get_point_query(point, include_global=include_global))
        if address:
            _queries.append("spatial_address:/.*{}/".format(address))
        if include_global:
            _queries.append(self.get_only_globals())
        return _queries


