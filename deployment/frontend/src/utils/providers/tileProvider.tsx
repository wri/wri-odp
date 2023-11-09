import type {
  LayerModel,
  LayerSpec,
  Source,
  ProviderMaker,
} from "@vizzuality/layer-manager";
import omit from "lodash/omit";

export class TileProvider implements ProviderMaker {
  public name = "tilelayer";

  private getTilerUrl = (layer: LayerSpec): string | Error => {
    //@ts-ignore
    return layer.source.tiles[0];
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
