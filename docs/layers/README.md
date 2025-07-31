# Layers

Layers are built usually of 4 main sections/concepts

- Source
    - This lives inside the `layerConfig` item in the layer attributes
    - This is the section of the config that deals with where the data is coming from, examples of things you are going to find here are.
    - If the data originally lives in carto, here you will see things like, the carto account that hold the data, the tablename, the sql necessary to fetch the data etc
    - If we are talking about a raster dataset, here you will find the url for the tile cache, whats the maximum and minimum zoom available etc
- Legend
    - This lives inside the `legendConfig` item in the layer attributes
    - Essentially the config for the legends, what the type, whats the color for each item etc
- InteractionConfig
    - This lives inside the `legendConfig` item in the layer attributes
    - The config for the tooltips shown when you click on a certain section of the layer
- Render
    - This lives inside the `layerConfig` item in the layer attributes
    - This is only used for vector layers, and its basically where you will find the information necessary to display the data, for example, what should the color of the borders between countries, if its a point dataset whats the size of each point, how that interacts with the data in the source etc

So on a general level, layers have this kind of structure 

```
{
layerConfig : {
    source: {...},
    render: {...}
},
legendConfig : {...},
interactionConfig: {...}
}
```

As you are probably aware, the layer object essentially accepts any valid JSON possible, and its up to the application that intends to use that data to enforce some kind of schema to its user, resourcewatch.org has a schema more or less similar to globalforestwatch, to the point where i think apart from some main differences a GFW Layer could be visualized in RW, the same cant be said of an Aqueduct layer for example, which doesnt follow the same schema.

In this intro i only talked about the 4 main sections that 99% of the datasets will contain, with that said, we have things like `decode_config`, `decode_function`, `params_config` which are specific to some datasets, i will also talk about those in this doc.

## Source

The source is relatively, there is essentially three versions that this object can take 

```
"source": {
"type": "raster",
"tiles": [
"https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/default/{z}/{x}/{y}.png"
],
"maxzoom": 14,
"minzoom": 2
},
```

This is a simple raster source, it specifies an array of tiles, which as far as i know is always of length 1, besides that we have the maxzoom and minzoom availables for the tile cache 

The second version has a gotcha

```
"source": {
                    "provider": {
                        "type": "gee"
                    },
                    "type": "raster",
                    "minzoom": 0,
                    "maxzoom": 14
                }
```

This is the layer for `Dynamic World` and as you can see there is no indication to where the data should come from, thats because GEE datasets work quite differently from other layers, we have a section just for them little bit below.

The final source type is for Vector datasets, which in the rw api can basically be understood as Carto datasets.

```
"source": {
    "type": "vector",
    "provider": {
        "type": "carto",
        "account": "wri-rw",
        "layers": [
            {
            "options": {
                "sql": "SELECT wri.cartodb_id, ST_Transform(wri.the_geom, 3857) AS the_geom_webmercator, wri.name, data.country, data.year, data.yr_data FROM ene_038_rw0_total_energy_production_edit data LEFT OUTER JOIN wri_countries_a wri ON wri.name ILIKE TRIM(data.country) WHERE data.year = 1980 AND wri.iso_a3 IS NOT NULL AND data.yr_data IS NOT NULL UNION SELECT wri.cartodb_id, ST_Transform(wri.the_geom, 3857) AS the_geom_webmercator, wri.name, data.country, data.year, data.yr_data FROM ene_038_rw0_total_energy_production_edit data INNER JOIN rw_aliasing_countries aliasing ON TRIM(data.country) ILIKE aliasing.alias INNER JOIN wri_countries_a wri ON wri.iso_a3 = aliasing.iso WHERE data.year = 1980 AND wri.iso_a3 IS NOT NULL AND data.yr_data IS NOT NULL",
                "type": "cartodb"
                }
            }
        ]
    }
},
```

As we can see its of type vector, it specifies the carto account that is going to be used, then we have this `layers` list, which as far as i know is always of length 1, which contains an object with type which is always `cartodb` and a `sql` which is how we can retrieve the data.

This entire config is basically telling the map object to fetch data from the URL `https://wri-rw.carto.com/api/v1/sql?q=SELECT wri.cartodb_id, ST_Transform(wri.the_geom, 3857) AS the_geom_webmercator, wri.name, data.country, data.year, data.yr_data FROM ene_038_rw0_total_energy_production_edit data LEFT OUTER JOIN wri_countries_a wri ON wri.name ILIKE TRIM(data.country) WHERE data.year = 1980 AND wri.iso_a3 IS NOT NULL AND data.yr_data IS NOT NULL UNION SELECT wri.cartodb_id, ST_Transform(wri.the_geom, 3857) AS the_geom_webmercator, wri.name, data.country, data.year, data.yr_data FROM ene_038_rw0_total_energy_production_edit data INNER JOIN rw_aliasing_countries aliasing ON TRIM(data.country) ILIKE aliasing.alias INNER JOIN wri_countries_a wri ON wri.iso_a3 = aliasing.iso WHERE data.year = 1980 AND wri.iso_a3 IS NOT NULL AND data.yr_data IS NOT NULL`

You can just copy and paste this on your browse and it should give you a list of rows

## Legends

This is the simplest one of them all, essentially is always something like this example

```
"legendConfig": {
    "items": [
        {
            "color": "#ffffb2",
            "name": "<0.5",
            "id": 0
        },
        {
            "color": "#fed976",
            "name": "<1",
            "id": 1
        },
        {
            "color": "#feb24c",
            "name": "<5",
            "id": 2
        },
        {
            "color": "#fd8d3c",
            "name": "<20",
            "id": 3
        },
        {
            "color": "#f03b20",
            "name": "<80",
            "id": 4
        },
        {
            "color": "#bd0026",
            "name": "≥80",
            "id": 5
        }
    ],
    "type": "choropleth"
```

The type can be 

- `basic`
![image](https://hackmd.io/_uploads/r1gCy757ke.png)
Essentially items will be ordered by the id, each item will have a `name` which is essentially a label, and also a color, which will be the color of the little square

- `choropleth`
![image](https://hackmd.io/_uploads/HJ1GlXc7kg.png)
Everything about the basic type holds true, except that now things are in the vertical, and istead of squares we have these lines that touch one another

- `gradient`
![image](https://hackmd.io/_uploads/Hkerem5Q1l.png)
In this type, items are still ordered by id, they still have a name that works as a label, but now the colors are merged together in a gradient

## Interaction Config

Here is an example of an `interactionConfig` object 

```
"interactionConfig": {
    "output": [
        {
            "suffix": "",
            "format": null,
            "column": "mag",
            "prefix": "",
            "property": "Magnitude",
            "type": "number"
        },
        {
            "suffix": "",
            "format": null,
            "column": "sig",
            "prefix": "",
            "property": "Significance",
            "type": "number"
        },
        {
            "column": "date_str",
            "format": null,
            "prefix": "",
            "property": "Time",
            "suffix": " UTC",
            "type": "string"
        }
],
```

Which is going to render a tooltip like this
![image](https://hackmd.io/_uploads/SyxdlMXcQyg.png)

As you can see we have 3 properties, mapping the 3 items in the `output` array in the object, lets take as an example the last one 

```
   {
            "column": "date_str",
            "format": null,
            "prefix": "",
            "property": "Time",
            "suffix": " UTC",
            "type": "string"
    }
```

This basically is saying that for the columns `date_str` in carto, we will say that its of type string, instead of calling it `date_str` we will call it `Time` and that we will add `UTC` as a suffix after the actual value.

I believe that `prefix` is self explanatory

`format` is used to format numbers, for examples, if we wanted to now show too many decimals, we could have set that to `0.0` instead of null, the [numeral.js](http://numeraljs.com/) library is used to make this convertion 

## Render 

This one is by far the most complex so we are going to use a lot of examples, the render object at least for the data-explorer is usually going to contain a single key `layers`, layers is going to be an array that follows the [mapbox spec](https://docs.mapbox.com/style-spec/reference/layers/).

### Example 1 - Line no filters

Lets start with the simplest example, the roads dataset

```
            layers: [
                {
                    paint: {
                        'line-color': ' #d95f0e',
                        'line-width': 0.5,
                        'line-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all'],
                },
            ],
```

As you can see we have a single layer and it contains 4 keys

- source-layer: this is always layer0, you need to set it there just to mapbox to work, no need to worry
- type: as far as i know all rw/gfw datasets are either type `line` / `circle` / `fill`
- filter: this will tell to what rows in the db we need to match, ins this case we have `all` so we will apply this render to every row
- paint: together with `filter` this is going to be what changes the most, but usually it will have 3 properties
    - {line/circle/fill}-color: In this case all lines will be colored #d95f0e
    - line datasets will usually have a line-width that defines how thick is the line
    - {line/circle/fill}-opacity: Defining how transparent should the color be

The end result here will be this
![image](https://hackmd.io/_uploads/SyUlk8o7ke.png)

### Example 2 - Circle Filters

Lets now an example that instead of lines shows circles and contains more complex filters

```
                {
                    paint: {
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all'],
                },
                {
                    paint: {
                        'circle-color': '#808080',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['==', 'ghg_fixed', 0]],
                },
                {
                    paint: {
                        'circle-color': '#fee5d9',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>', 'ghg_fixed', 0],
                        ['<', 'ghg_fixed', 20000],
                    ],
                },
 ....
                 {
                    paint: {
                        'circle-color': '#a50f15',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['>=', 'ghg_fixed', 200000]],
                },
```

We start with the default options for all circles in the first render item

```
                {
                    paint: {
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all'],
                },
```

This should be familiar now to you, for every row in the db, we want to have a circle of radius 7 and opacity 1

Now lets move on to the second render item

```
  {
                    paint: {
                        'circle-color': '#808080',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['==', 'ghg_fixed', 0]],
                },
```

As you can see the filter is now a little bit different, filters are set as an array of predicates, predicates have usually the following structure

`[operation, column, value]`

With that in mind, we are asking it to match all rows WHERE ghg_fixed = 0 and paint them as #808080

The next render item has 2 predicetes

```
{
                    paint: {
                        'circle-color': '#fee5d9',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>', 'ghg_fixed', 0],
                        ['<', 'ghg_fixed', 20000],
                    ],
                },
```

What this item is saying therefore is, WHERE ghg_fixed > 0 AND ghg_fixed < 20000, paint the circle in #fee5d9

The end result being this

![image](https://hackmd.io/_uploads/SJUlZ8oQ1g.png)

### Example 3 - Fill filters

A second example which is very similar to the previous can be found here

```
                {
                    paint: {
                        'line-width': 0.5,
                        'line-opacity': 1,
                        'line-color': '#30c2df',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'fill-color': ' #30c2df',
                        'fill-opacity': 0.3,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'line-color': '#0570b0',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'fill-color': ' #0570b0',
                        'fill-opacity': 0.3,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'line-color': '#beefee',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
                },
                {
                    paint: {
                        'fill-color': '#beefee',
                        'fill-opacity': 0.3,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
                },
            ],
 ```

As you can see here we are using filters to define both the line-color and the fill-color, each one being defined in a separate item, the end result being this

![image](https://hackmd.io/_uploads/S1S3ZIsXke.png)

### Example 4 - Steps

In the 2 examples above, we need to specify an item for every one of the paint properties that we want to use, there is however a more concise way to write this

```
            layers: [
                {
                    paint: {
                        'fill-color': [
                            'step',
                            ['to-number', ['get', 'yr_data']],
                            '#ffffcc',
                            0.5,
                            '#a1dab4',
                            0.7,
                            '#41b6c4',
                            0.75,
                            '#2c7fb8',
                            0.85,
                            '#253494',
                        ],
                        'fill-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all'],
                },
                {
                    paint: {
                        'line-width': 0.5,
                        'line-color': '#fff',
                        'line-opacity': 0.8,
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all'],
                },
            ],
```

The example below will get rendered like this 

![image](https://hackmd.io/_uploads/Sksw0y6myl.png)

As you can see we were able to render a different color for each country even tough we didnt specify multiple items

```
'fill-color': [
                            'step',
                            ['to-number', ['get', 'yr_data']],
                            '#ffffcc',
                            0.5,
                            '#a1dab4',
                            0.7,
                            '#41b6c4',
                            0.75,
                            '#2c7fb8',
                            0.85,
                            '#253494',
                        ],
```

Properties like fill-color/line-color and circle-color also accept this function syntax. Translating this to plain english we are

1. Using the `step` function (There is another type)
2. As input we are getting the `yr_data` column and making sure that its a number
3. After that we are saying
    4. below 0.5 paint #ffffcc
    5. 0.5 to 0.7 paint #a1dab4
    6. 0.75 to 0.85 paint #2c7fb8
    7. above 0.85 paint #253494

Documentation for it can be found [here](https://docs.mapbox.com/style-spec/reference/expressions/#step)

### Example 5 - Interpolate

Lets say however that instead of a hard stop, we want to have a gradient of colors, we can change that `step` function to `interpolate` `interpolate-lab` or `interpolate-hcl`, the differences can be found [here](https://docs.mapbox.com/style-spec/reference/expressions/#interpolate)

This render method below for example

```
                {
                    paint: {
                        'fill-color': [
                            'interpolate-lab',
                            ['linear'],
                            ['to-number', ['get', 'd_t_diff']],
                            -3,
                            '#3288bd',
                            -2,
                            '#66c2a5',
                            -1,
                            '#abdda4',
                            0,
                            '#ffffbf',
                            1,
                            '#fdae61',
                            2,
                            '#f46d43',
                            3,
                            '#d53e4f',
                        ],
                        'fill-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all'],
                },
```

Will get rendered like so

![image](https://hackmd.io/_uploads/Syjlgxamye.png)

## params_config

This is a field used by some GFW datasets to setup this select field 
![image](https://hackmd.io/_uploads/r1Ky8Q57yg.png)

```
"params_config": [
                    {
                        "sentence": "Displaying tree cover loss with {selector} canopy density",
                        "options": [
                            {
                                "label": ">10%",
                                "value": 10
                            },
                            {
                                "label": ">15%",
                                "value": 15
                            },
                            {
                                "label": ">20%",
                                "value": 20
                            },
                            {
                                "label": ">30%",
                                "value": 30
                            },
                            {
                                "label": ">50%",
                                "value": 50
                            },
                            {
                                "label": ">75%",
                                "value": 75
                            }
                        ],
                        "default": 30,
                        "key": "thresh",
                        "required": true
                    }
                ],
```

The datasets that have a threshold have a tilecache in this format

`https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_{thresh}/{z}/{x}/{y}.png`

Pay attention to the `{thresh}` in the URL, what this is telling us is that this particular dataset actually has multiple tilecaches, one for each threshold, so basically all that we do when we select a particular threshold is to inject the `value` from that particular item, into the URL, the `label` you can imagine is used to set the option in the select field, the `key` is used to know what part of the url string needs to be injected with an actual value, and the default what shall be used when nothing is selected.

# decode_config, decode_function 

Lets keep using the tree cover loss dataset, which contains the following fields

```
"decode_config": [
{
    "default": "2001-01-01",
    "key": "startDate",
    "required": true
},
    {
    "default": "2023-12-31",
    "key": "endDate",
    "required": true
    }
],
"decode_function": "treeCoverLoss",
```

Tree cover loss is a dataset that requires a shader to function properly, lets take a look at the code for this decode_function

```
// values for creating power scale, domain (input), and range (output)
    float domainMin = 0.;
    float domainMax = 255.;
    float rangeMin = 0.;
    float rangeMax = 255.;

    float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
    float intensity = color.r * 255.;

    // get the min, max, and current values on the power scale
    float minPow = pow(domainMin, exponent - domainMin);
    float maxPow = pow(domainMax, exponent);
    float currentPow = pow(intensity, exponent);

    // get intensity value mapped to range
    float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
    // a value between 0 and 255
    alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

    float year = 2000.0 + (color.b * 155.);
    // map to years
    if (year >= startYear && year <= endYear && year >= 2001.) {
      color.r = 225. / 255.;
      color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
      color.b = (0. - zoom + 153. - intensity / zoom) / 255.;
    } else {
      alpha = 0.;
    }
```

You dont really need to understand this function fully to see that it requires a couple of values, in this case `startYear` and `endYear`

The important thing to note here is that startYear and endYear are not mapped directly to startDate and endDate, the shaders only take numbers, so there is some convertion that takes place.

![image](https://hackmd.io/_uploads/ryyZKXcXkx.png)

What happens in GFW when you select one of the years is that we essentially change the startYear and endYear respectively on the shader

Datasets like `Tree Cover Loss` / `Tree Cover Gain` are essentially "finished" meaning that no new data is coming in, we have a startYear of 2001 and a endYear of 2023, and thats all necessary to load the dataset

The integrated alerts on the other hand are different, lets take for example RADD

```
"decode_config": [
    {
        "default": "2014-12-31",
        "key": "minDateAbsolut",
        "required": true
    },
    {
        "default": "2019-01-01",
        "key": "startDate",
        "required": true
    },
    {
        "key": "endDate",
        "required": true,
        "url": "https://data-api.globalforestwatch.org/dataset/wur_radd_alerts/latest",
        "default": 549,
        "interval": "days",
        "max": 730
    }
],
"decode_function": "RADDs2yearsTimeline",
```

Lets take a look at the decode_function

```
  // values for creating power scale, domain (input), and range (output)
    float confidenceValue = 0.;
    if (confirmedOnly > 0.) {
      confidenceValue = 1.;
    }

    float r = color.r * 255.;
    float g = color.g * 255.;
    float b = color.b * 255.;

    // **** CHECK THIS
    // 1461 = days from 2019/01/01 to 2014/12/31
    // 1870 = days from 2020/02/14 to 2014/12/31
    float day = (r * 255.) + g;

    float confidence = floor(b / 100.) - 1.;
    if (
      day > 0. &&
      day >= startDayIndex &&
      day <= endDayIndex  &&
      confidence >= confidenceValue
    ) {
      // get intensity
      float intensity = mod(b, 100.) * 150.;
      // float intensity = 255.;
      if (intensity > 255.) {
        intensity = 255.;
      }
      if (confidence < 1.) {
        color.r = 237. / 255.;
        color.g = 164. / 255.;
        color.b = 194. / 255.;
        alpha = intensity / 255.;
      } else {
        color.r = 220. / 255.;
        color.g = 102. / 255.;
        color.b = 153. / 255.;
        alpha = intensity / 255.;
      }
    } else {
      alpha = 0.;
    }
 ```
 
 Here the dynamic values are `startDayIndex` and `endDayIndex`, which as far as i know are an integer representing the days since the alert started capturing data. 
 
As you can see in the `decode_config` the endDate is a URL, what this means is that when we load the layer, we need to grab the latest date from that url and only then make the necessary convertions to inject the values in the shader.

## Timeline

Normally when we render multiple layers together we can switch between this by using this select.  

![image](https://hackmd.io/_uploads/Sydsxx6XJx.png)

However if you add these items in the layer

```
"timelineLabel": "04",
"order": 4,
"timeline": true,
```

The toggle will be rendered like this timeline

![image](https://hackmd.io/_uploads/H12xWeaQ1x.png)

Most of the time this is used when each layer represents a date in time, for example in this hunger index layer

![image](https://hackmd.io/_uploads/ryzH-lam1l.png)

## GEE Layers

GEE Layers are special, the raster files dont come from a tile cache in S3 for example, but from GEE, we however do not fetch these files directly from the browser to GEE, we go thru one of the resource watch api microservices.

Essentially instead of calling something like

`https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/default/{z}/{x}/{y}.png`

We call something like 

`https://api.resourcewatch.org/v1/layer/{layer_id}/tile/gee/{z}/{x}/{y}`

This ends up calling the service defined in here https://github.com/resource-watch/gee-tiles that service them calls GEE and retrieves the data, the question now becomes, how it knows what to retrieve?

It will use a couple of items from the `layerConfig` for that

In the most basic scenario, my understanding is that you need an `assetId` and a generic `body`

In the most basic scenario the tile service, will use the `assetId` to grab an `Image` object and them just dump the contents of body into this [function](https://developers.google.com/earth-engine/apidocs/ee-data-getmapid)

Most of the examples that i found tough, have a body that contains the key `styleType` = `sld`

When that key is found in the body it needs to be paired with an `sldValue` in this case the tile service calls this [function](https://developers.google.com/earth-engine/apidocs/ee-image-sldstyle) before returning the image

Here is an example of something like this 

```
"layerConfig": {
    "body": {
    "sldValue": "<RasterSymbolizer>     <ColorMap type=\"ramp\" extended=\"false\" > '<ColorMapEntry color=\"#000003\" quantity=\"-1\"/>'+'<ColorMapEntry color=\"#000003\" quantity=\"0.000005\"/>' + '<ColorMapEntry color=\"#550F6D\" quantity=\"0.00001\"/>' + '<ColorMapEntry color=\"#BA3655\" quantity=\"0.00003\"/>' +  '<ColorMapEntry color=\"#F98C09\" quantity=\"0.0001\"/>' + '<ColorMapEntry color=\"#FCFEA4\" quantity=\"0.0003\"/> </ColorMap>   </RasterSymbolizer>",
    "styleType": "sld"
    },
    "assetId": "projects/resource-watch-gee/cit_035_tropomi_atmospheric_chemistry_model_30day_avg/NO2/cit_035_tropomi_atmospheric_chemistry_model_30day_avg_NO2_2024-12-04",
"isImageCollection": false,
    "type": "raster",
    "source": {
            "provider": {
            "type": "gee",
            "options": {}
        },
        "type": "raster",
        "tiles": [],
        "minzoom": 3,
        "maxzoom": 12
    }
},
```

If the body also contains a `clipRegionId` key we use the value in there to grab a `FeatureCollection` item and then clip the image to that object using this [function](https://developers.google.com/earth-engine/apidocs/ee-image-cliptocollection)

This is overall a simple layer which only matches to a single `Image`, but layers can also reference [`ImageCollection`](https://developers.google.com/earth-engine/guides/ic_creating) objects, [Dynamic World](https://api.resourcewatch.org/v1/dataset/Dynamic-World?env=production&includes=metadata,layer,vocabulary,widget&application=rw) being such an example, to flag that the layer is an `ImageCollection` we sed `isImageCollection` to true in the `layerConfig` 

ImageCollections allow us to use two extra keys

`filterDate` - This allow us to call this [function](https://developers.google.com/earth-engine/apidocs/ee-imagecollection-filterdate) on the ImageCollection
`position` - This can have 3 values
    - `mosaic` - This will call this [function](https://developers.google.com/earth-engine/apidocs/ee-imagecollection-mosaic) on the ImageCollection
    - `first` - This will grab the first image inside the ImageCollection by sorting thru `system:time_start`(acquisition time of an image) and grabbing the first one
    - `last` - Same as before but grabbing the last one
    
`Dynamic WOrld` is an example of a GEE Layers that tracks an `ImageCollection` 

```
"layerConfig": {
    "type": "raster",
    "isImageCollection": true,
    "position": "mosaic",
    "assetId": "projects/project-earth/dw_2022_04_vis",
    "timelineLabel": "04",
    "order": 4,
    "timeline": true,
    "body": {
        "styleType": "sld",
        "clipRegionId": "USDOS/LSIB/2017",
        "sldValue": "<RasterSymbolizer><ChannelSelection><RedChannel><SourceChannelName>vis-red</SourceChannelName></RedChannel><GreenChannel><SourceChannelName>vis-green</SourceChannelName></GreenChannel><BlueChannel><SourceChannelName>vis-blue</SourceChannelName></BlueChannel></ChannelSelection></RasterSymbolizer>"
    },
    "source": {
        "provider": {
            "type": "gee"
        },
        "type": "raster",
        "minzoom": 0,
        "maxzoom": 14
    }
},




