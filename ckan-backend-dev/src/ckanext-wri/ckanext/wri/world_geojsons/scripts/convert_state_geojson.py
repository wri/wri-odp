#!/usr/bin/env python
# -*- coding: utf-8 -*-

import fiona
import json
import os

shape = fiona.open("ne_10m_admin_1_states_provinces.shp")

root_dir = '../states'

def clear_dir(root):
    for root, dirs, files in os.walk(root, topdown=False):
        for name in files:
            file_dir = os.path.join(root, name)
            os.remove(file_dir)
        for name in dirs:
            dir_dir = os.path.join(root, name)
            clear_dir(dir_dir)
            os.rmdir(os.path.join(root, name))

try:
    clear_dir(root_dir)
    os.rmdir(root_dir)
except Exception as e:
    print(e)
os.mkdir(root_dir)

for feat in shape:
    country_name = feat.properties["admin"]
    state_name = feat.properties["name_en"]

    geometry = json.dumps(dict(feat.geometry))

    country_dir = '{}/{}'.format(root_dir, country_name)

    if not os.path.exists(country_dir):
        os.mkdir(country_dir)

    if state_name and len(state_name.split('/')) > 1:
        state_name = state_name.split('/')[1]

    with open('{}/{}.geojson'.format(country_dir, state_name if state_name else country_name), "w+") as f:
        print(country_name, state_name)
        f.write(geometry)
        


    


    
    
    
    

