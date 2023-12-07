
import { InteractionFormType } from "@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/layer.schema";
import type { Source, LayerType } from "@vizzuality/layer-manager";

export interface DeckProps {
  type: "deck";
  params?: Record<string, unknown>;
  data: string;
  subtype: string;
}

export interface layerConfigBodySpec {
  attribution?: string;
}

export interface Render {
  layers?: Record<string, string | number | boolean | unknown>[];
}

export interface layerConfigSpec {
  type: LayerType;
  render?: any;
  source: Partial<Source>;
  [key: string]:
    | Record<string, string | number | boolean | unknown>
    | string
    | boolean
    | number;
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
