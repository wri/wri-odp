import { assign, createMachine } from "xstate";
import { SourceFormType } from "../forms/SourceForm";
import { LegendsFormType } from "../forms/LegendsForm";

interface LayerEditorContext {
  source: SourceFormType | null;
  legendConfig: LegendsFormType | null;
}

interface UpdateSourceEvent {
  type: "sourceUpdate";
  data: SourceFormType;
}

interface UpdateLegendsEvent {
  type: "legendUpdate";
  data: LegendsFormType;
}

const layerEditorMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCGBPMAnAohAlgC4D2WAsqgMYAW+AdmAHSxiEDKxArlpWAMQA5HAA0AKgG0ADAF1EoAA7FYRfMTpyQAD0QBGAOwAWRgE4DAJj06dANgDMxgByTjAVgA0IdLts6T5vc62knpmLi7WAL4RHmiYuAQk5FS0DMysADJgMHQQAMJqAGb4UIIiEjIaisqEqupIWogG1mYmetYuhjoGOi6Bth5eCDq2Rgb+gcGh4VExGNh4RKQUNPRMLISZ2XmFxXwACgBKOABqUrL1VSpqGtpDbYySttZN+mYGDr0uBgOIDr4GemMNksxh8Vh0ZhmIFi8wSS2SqzShAAknRCNgqDU1Pk6EUSocTmdKkornVQLcmkZgo83mYzO1et9PL9bK0gdYQWCrJCoXRiBA4BoYfFFkkVgxidVajdEABaaw-BDyh6SVVq9WqrpQ4ULRLLFJrVgcbi8SWkmUIcyKhx6RhfPSGWxmJ2SAymHTauYivUI1LrTZgHI4vFmrFkhoICwORi2JxmfR6WNNaw6RXGSQPAGO51mV2mAyeuK6+Hiw0otEYyhh4PFUPS+q3cLWRjdAySONtmwK5kIYwte3Zl1uppRKJAA */
  id: "layerEditorMachine",
  initial: "setSource",
  schema: {
    context: {} as LayerEditorContext,
  },
  context: {
    source: null,
    legendConfig: null,
    interactionConfig: null,
  } as LayerEditorContext,
  states: {
    setSource: {
      on: {
        sourceUpdate: {
          actions: assign<LayerEditorContext, UpdateSourceEvent>({
            source: (_, event) => event.data,
          }),
        },
        NEXT: "setLegendConfig",
      },
    },
    setLegendConfig: {
      on: {
        legendsUpdate: {
          actions: assign<LayerEditorContext, UpdateLegendsEvent>({
            legendConfig: (_, event) => event.data,
          }),
        },
        NEXT: "setInteractionConfig",
        PREV: "setSource",
      },
    },
    setInteractionConfig: {
      on: {
        PREV: "setLegendConfig",
        NEXT: "setRenderConfig",
      },
    },
    setRenderConfig: {
      on: {
        PREV: "setInteractionConfig",
      },
    },
  },
});

export default layerEditorMachine;
