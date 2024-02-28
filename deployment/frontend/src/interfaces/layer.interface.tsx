
import { InteractionFormType } from "@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/layer.schema";
import { TileLayer } from "@deck.gl/geo-layers";
import type { Source, LayerType } from "@vizzuality/layer-manager";

export interface DeckProps {
  type: "deck";
  params?: Record<string, unknown>;
  data: string;
  subtype: string;
}

export interface DeckLayerSpec {
  id: string;
  type: 'deck';
  deck: TileLayer<any, any>[];
}

export interface layerConfigBodySpec {
  attribution?: string;
}

export interface Render {
  layers?: Record<string, string | number | boolean | unknown>[];
}

export type Provider = {
  type: 'carto' | string
  options: Record<string, unknown>
  layers: any[]
};

export interface layerConfigSpec {
  type: LayerType;
  render_function?: string;
  render?: any;
  source: Partial<Source & { provider: Provider, maxzoom: number, minzoom: number }>;
  [key: string]:
    | Record<string, string | number | boolean | unknown>
    | string
    | boolean
    | number
    | undefined;
  attribution?: any;
  body?: any;
  deck?: any;
}

export interface APILayerSpec {
  id: string;
  name: string;
  dataset?: string;
  slug: string;
  description?: string;
  application: string[];
  type?: string;
  iso: string[];
  provider: string;
  userId?: string;
  default: boolean;
  rw_id?: string;
  protected: boolean;
  published: boolean;
  env: string;
  thumbnailUrl?: string;
  connectorUrl?: string | null;
  layerConfig: layerConfigSpec;
  legendConfig: Record<string, string | number | boolean | unknown>;
  applicationConfig: Record<string, string | number | boolean | unknown>;
  interactionConfig?: InteractionFormType;
  staticImageConfig: Record<string, string | number | boolean | unknown>;
  createdAt?: string;
  updatedAt?: string;
}
