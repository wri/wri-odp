// @ts-nocheck
/* eslint-disable no-underscore-dangle */
import rasterLayer from './raster-layer-mapbox-gl';
import vectorLayer from './vector-layer-mapbox-gl';
import geoJsonLayer from './geojson-layer-mapbox-gl';
import videoLayer from './video-layer-mapbox-gl';
import deckLayer from './deck-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map, options = {}) {
    this.map = map;
    this.options = options;

    // You can change map styles and all the layers will be repositioned
    this.map.on('style.load', () => {
      const layers = this.getLayers();

      layers.forEach((layer) => {
        this.add(layer);
      });
    });
  }

  type = {
    raster: rasterLayer,
    vector: vectorLayer,
    geojson: geoJsonLayer,
    video: videoLayer,
    deck: deckLayer,
  };

  setOptions(options = {}) {
    this.options = options;
  }

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    const {
      images, mapLayer, opacity, visibility,
    } = layerModel;
    const allLayers = this.getLayers();

    if (Array.isArray(images)) {
      images.forEach(({ id, src, options }) => {
        if (!this.map.hasImage(id)) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            this.map.addImage(id, img, options);
          };
        }
      });
    }

    // add source if it has one
    if (
      this.map
      && mapLayer
      && mapLayer.source
      && mapLayer.id
      && !this.map.getSource(mapLayer.id)
    ) {
      this.map.addSource(mapLayer.id, mapLayer.source);
    }

    // add layers
    if (mapLayer && mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        const { metadata = {} } = l;
        const nextLayerId = metadata.position === 'top' ? null : this.getNextLayerId(layerModel);

        if (this.map && !this.map.getLayer(l.id)) {
          this.map.addLayer(l, nextLayerId);
        }

        allLayers.forEach(() => {
          this.setZIndex();
        });
      });

      this.setOpacity(layerModel, opacity);
      this.setVisibility(layerModel, visibility);
    }
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel = {}) {
    const { mapLayer } = layerModel;
    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach((l) => {
        if (this.map.getLayer(l.id)) {
          this.map.removeLayer(l.id);
        }
      });
    }

    if (mapLayer && !!this.map && this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }
  }

  getMap() {
    return this.map;
  }

  /**
   * Get method by type
   * @param {String} type
   */
  getLayerByType(type) {
    return this.type[type];
  }

  /**
   * Get all mapbox layers
   */
  getLayersOnMap() {
    return this.map.getStyle().layers;
  }

  getLayer(layerModel) {
    const { mapLayer } = layerModel;

    if (this.map) {
      return this.map.getSource(mapLayer.id);
    }

    return null;
  }

  /**
   * Get all layers passed to layer manager
   */
  getLayers() {
    const { getLayers } = this.options;
    const layers = getLayers();

    return layers.sort((a, b) => {
      if (Object.prototype.hasOwnProperty.call(a, 'decodeFunction')
        && !Object.prototype.hasOwnProperty.call(b, 'decodeFunction')) return -1;

      return 1;
    });
  }

  /**
   * Get the layer above the given z-index
   * @param {Object} layerModel
   */
  getNextLayerId(layerModel) {
    const { zIndex } = layerModel;
    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();

    // find the top layer for placing data layers below
    const customLayer = layersOnMap
      && layersOnMap.length
      && layersOnMap.find(
        (l) => l.id.includes('custom-layers')
          || l.id.includes('label')
          || l.id.includes('place')
          || l.id.includes('poi'),
      );

    // make sure layers are sorted by zIndex
    const sortedLayers = allLayers.sort((a, b) => {
      if (a.zIndex > b.zIndex) return 1;

      return -1;
    });

    // get the layer with zIndex greater than current layer from all layers
    const nextLayer = sortedLayers.find(
      (l) => l.zIndex > zIndex
        && (!l.mapLayer
          || !l.mapLayer.layers
          || !l.mapLayer.layers[0]
          || !l.mapLayer.layers[0].metadata
          || !l.mapLayer.layers[0].metadata.position),
    );

    // if no layer above it then use the custom layer
    if (!nextLayer || (!!nextLayer && !nextLayer.mapLayer)) {
      return customLayer.id;
    }

    // get the first layer of the next layer's array
    const nextLayerMapLayers = nextLayer.mapLayer.layers;
    const nextLayerMapLayer = nextLayerMapLayers[0];

    // Filter layers with custom metadata position
    const { id } = nextLayerMapLayer;

    // if it has a layer above it, check if that layer has been added to the map and get its id
    const isNextLayerOnMap = !!layersOnMap.find((l) => id === l.id);

    // if next layer is on map return the id, else return the custom layer to add below
    return isNextLayerOnMap ? id : customLayer.id;
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   */
  setZIndex() {
    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();

    // set zIndex for all layers currently on map
    layersOnMap.forEach((l) => {
      const { id, metadata = {} } = l;
      const layerModel = allLayers.find((ly) => id.includes(ly.id));

      if (layerModel) {
        const nextLayerId = metadata.position === 'top' ? null : this.getNextLayerId(layerModel);
        this.map.moveLayer(id, nextLayerId);
      }
    });

    // set for all decode layers that don't exist inside mapStyle()
    const deckLayers = allLayers.filter((l) => l.type === 'deck');

    if (deckLayers && this.map) {
      deckLayers.forEach((layerModel) => {
        const { mapLayer } = layerModel;

        if (mapLayer) {
          const { layers } = mapLayer;
          const [parentLayer, ...childLayers] = layers;

          const parentLayerOnMap = layersOnMap.find((ly) => ly.id === parentLayer.id);
          childLayers.forEach((childLayer) => {
            const childLayerOnMap = this.map.getLayer(childLayer.id);

            if (parentLayerOnMap && childLayerOnMap) {
              this.map.moveLayer(childLayer.id, parentLayer.id);
            }
          });
        }
      });
    }

    return true;
  }

  /**
   * Given a desired value to give to a paint property of a layer, this function will return the
   * correct value to set, by taking into account other factors such as the opacity of the layer
   * @param {object} layerModel LayerModel instance
   * @param {string} layerId ID of the layer that contains the property
   * @param {string} propertyName Name of the property to set
   * @param {any} desiredValue Value to give the property
   */
  // eslint-disable-next-line class-methods-use-this
  computePaintPropertyValue(layerModel, layerId, propertyName, desiredValue) {
    const {
      opacity,
      render: { layers = [] },
      mapLayer,
    } = layerModel;
    const isOpacityProperty = /-opacity$/.test(propertyName);

    // The opacity of the layer isn't relevant for this property
    if (!isOpacityProperty) {
      return desiredValue;
    }

    const { paint = {} } = layers.find((layer, index) => {
      if (layer.id === undefined || layer.id === null) {
        return `${mapLayer.id}-${layer.type}-${index}` === layerId;
      }

      return layer.id === layerId;
    }) || {};
    const currentValue = paint[propertyName];

    let res = 0.99 * opacity;

    if (currentValue !== undefined && currentValue !== null) {
      if (typeof currentValue === 'number') {
        res = currentValue * opacity * 0.99;
      } else if (Array.isArray(currentValue)) {
        res = currentValue.map((element) => (typeof element === 'number' ? element * opacity * 0.99 : element));
      }
    }

    return res;
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const PAINT_STYLE_NAMES = {
      symbol: ['icon', 'text'],
      circle: ['circle', 'circle-stroke'],
    };

    const { type, mapLayer } = layerModel;

    if (mapLayer.layers && type !== 'deck') {
      mapLayer.layers.forEach((l) => {
        // Select the style to change depending on the type of layer
        const paintStyleNames = PAINT_STYLE_NAMES[l.type] || [l.type];

        // Loop each style name and check if there is an opacity in the original layer
        paintStyleNames.forEach((name) => {
          const propertyName = `${name}-opacity`;
          const propertyValue = this.computePaintPropertyValue(
            layerModel,
            l.id,
            propertyName,
            opacity,
          );

          this.map.setPaintProperty(l.id, propertyName, propertyValue);
        });
      });
    }

    if (type === 'deck') {
      const layer = mapLayer.layers[1];

      if (layer && typeof layer.setProps === 'function') {
        layer.setProps({ opacity });
      }
    }
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;

    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach((l) => {
        this.map.setLayoutProperty(l.id, 'visibility', visibility ? 'visible' : 'none');
      });
    }
  }

  setSource(layerModel) {
    const { id, source } = layerModel;
    const { type, data } = source;

    if (this.map && type === 'geojson' && !!data && typeof data !== 'string') {
      const src = this.map.getSource(id);
      src.setData(data);
    }
    return this;
  }

  setRender(layerModel) {
    const { mapLayer, render } = layerModel;
    const { layers: renderLayers = [] } = render;

    if (!mapLayer || !renderLayers.length) {
      return this;
    }

    try {
      mapLayer.layers?.forEach((layer, i) => {
        const { id } = layer;
        // take the style for each layer or use the first one for all of them
        const rl = renderLayers[i] || renderLayers[0] || {};
        const { paint = {}, layout = {}, filter = null } = rl;

        this.map.setFilter(id, filter);

        Object.keys(paint).forEach((p) => {
          this.map.setPaintProperty(
            id,
            p,
            this.computePaintPropertyValue(layerModel, id, p, paint[p]),
          );
        });

        Object.keys(layout).forEach((l) => {
          this.map.setLayoutProperty(id, l, layout[l]);
        });
      });
    } catch (error) {
      console.error(error);
    }
    return this;
  }

  setParams() {
    return this;
  }

  setSQLParams() {
    return this;
  }

  setDeck(layerModel) {
    const { mapLayer, deck } = layerModel;

    mapLayer?.layers?.forEach((layer, i) => {
      if (layer && layer.setProps && typeof layer.setProps === 'function') {
        const dl = deck[i - 1];
        if (dl) {
          const { props: deckProps } = dl;

          layer.setProps(deckProps);
        } else {
          console.warn('No deck layer found for layer', layer);
        }
      }
    });

    return this;
  }

  unmount() {
    this.map = null;
  }
}

export default PluginMapboxGL;
