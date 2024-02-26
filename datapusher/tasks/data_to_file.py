from prefect import task, get_run_logger
from pandas import DataFrame
import json


@task(retries=3, retry_delay_seconds=15)
def data_to_file(data: list, tmp_filepath: str, format: str):
    logger = get_run_logger()
    # TODO: convert to file
    if format == "GeoJSON":
        geojson = {
                "type": "FeatureCollection",
                "features": []
                }

        for row in data:
            properties = {x: row[x] for x in row if x not in ["geometry", "the_geom", "the_geom_webmercator", "geom"]}
            id = row.get("cartodb_id")
            geojson_feature = {"type": "Feature", "id": id, "properties": properties}

            geometry = row.get("geometry")
            if geometry:
                geometry = json.loads(geometry)
                geojson_feature["geometry"] = geometry

                geojson["features"].append(geojson_feature)

        with open(tmp_filepath, "w+") as f:
            json.dump(geojson, f)

        return

    df = DataFrame.from_records(data)

    if format == "CSV":
        df.to_csv(tmp_filepath)
    elif format == "XLSX":
        df.to_excel(tmp_filepath)
    elif format == "XML":
        columns = {}
        for i in range(0, len(list(df.columns))):
            columns[df.columns[i]] = df.columns[i].replace(" ", "_")

        logger.info(columns)
        df = df.rename(columns=columns)
        logger.info(df.columns)
        df.to_xml(tmp_filepath)
    elif format == "JSON":
        df.to_json(tmp_filepath, orient="index")
    elif format == "TSV":
        df.to_csv(tmp_filepath, sep="\t")
    else:
        raise "Invalid format"
