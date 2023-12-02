import type {
  LayerModel,
  LayerSpec,
  Source,
  ProviderMaker,
} from "@vizzuality/layer-manager";
import omit from "lodash/omit";

export class GeeProvider implements ProviderMaker {
  public name = "gee";

  private getTilerUrl = (layer: LayerSpec): string | Error => {
    console.log('Layer inside provider', layer)
    if (!layer) throw new Error("layer required to generate tiler URL");
    return `https://api.resourcewatch.org/v1/layer/${layer.id}/tile/gee/{z}/{x}/{y}`;
  };

  public handleData = (
    layerModel: LayerModel,
    layer: LayerSpec,
    resolve?: (layerSpec: LayerSpec) => void,
    reject?: (err: Error) => void
  ): void => {
    try {
      const result = {
        ...layer,
        source: {
          ...omit(layer.source, "provider"),
          tiles: [this.getTilerUrl(layer)!],
        } as Source,
      };
      if (resolve) {
        resolve(result);
      }
    } catch (error: any) {
      if (reject) {
        reject(new Error(error.message));
      }
    }
  };
}
