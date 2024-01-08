#!/usr/bin/env python
# -*- coding: utf-8 -*-

import fiona
import json
import os

shape = fiona.open("ne_10m_admin_0_countries.shp")

root_dir = '../countries'

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
    country_name = feat.properties["NAME_EN"]

    geometry = json.dumps(dict(feat.geometry))

    with open('{}/{}.geojson'.format(root_dir, country_name), "w+") as f:
        print(country_name)
        f.write(geometry)
        


    


    
    
    
    

