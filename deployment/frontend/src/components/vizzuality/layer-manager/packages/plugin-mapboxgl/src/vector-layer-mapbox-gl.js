// @ts-nocheck
import { CancelablePromise } from 'cancelable-promise';
import { getVectorStyleLayers } from './vector-style-layers';

const VectorLayer = (layerModel, providers) => {
  const { source = {}, render = {}, id } = layerModel;

  const { provider } = source;

  const { layers } = render;

  const layer = {
    id,
    source: {
      type: 'vector',
      ...source,
    },
    ...render,
    layers: getVectorStyleLayers(layers, layerModel),
  };

  if (provider) {
    const method = providers[provider.type];

    return new CancelablePromise((resolve, reject) => {
      if (!method) {
        reject(
          new Error(
            `${provider.type} provider is not supported. Try to add it to the providers method when you initialize layer-manager`,
          ),
        );
      }

      method.call(this, layerModel, layer, resolve, reject);
    });
  }

  return new CancelablePromise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default VectorLayer;
