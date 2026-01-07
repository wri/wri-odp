import requests
from shapely.geometry import shape
from shapely import wkb, wkt
from shapely.ops import transform
from pyproj import Transformer
from ckan.common import config
import geoalchemy2
import logging

log = logging.getLogger(__name__)

large_isos = [
    'Brazil',
    'Russia',
    'Canada',
    'Australia',
    'Indonesia',
    'People\'s Republic of China',
    'United States',
    'Antarctica'
]

def get_shape_from_dataapi(address: str, point):
    try:
        api_key: str = config.get("ckanext.wri.gfw_api_key", '')
        headers = {"x-api-key": api_key, "Content-Type": "application/json"}
        split_address = address.split(",")
        shape = None
        simplification_factor = '0.05' if address in large_isos else '0.001'
        if len(split_address) == 1:
            url = f"https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1/query?sql=SELECT country,ST_asText(ST_SimplifyPreserveTopology(ST_RemoveRepeatedPoints(geom, {simplification_factor}), {simplification_factor})) AS simplified_geom FROM gadm_administrative_boundaries WHERE adm_level='0' AND ST_Contains(geom, ST_SetSRID(ST_Point({point[0]}, {point[1]}), 4326)) limit 1;"
            response = requests.get(url, headers=headers)
            data = response.json()
            if len(data["data"]) > 0:
                shape = data["data"][0]["simplified_geom"]
        if len(split_address) == 2:
            url = f"https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1/query?sql=SELECT country,ST_asText(ST_SimplifyPreserveTopology(ST_RemoveRepeatedPoints(geom, 0.001), 0.001)) AS simplified_geom FROM gadm_administrative_boundaries WHERE adm_level='1' AND ST_Contains(geom, ST_SetSRID(ST_Point({point[0]}, {point[1]}), 4326)) limit 1;"
            response = requests.get(url, headers=headers)
            data = response.json()
            if len(data["data"]) > 0:
                shape = data["data"][0]["simplified_geom"]
        return shape
    except Exception as e:
        log.error(f"Error getting shape from data-api: {e}")
        return None



