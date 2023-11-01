import classNames from "@/utils/classnames";
import { useMachine } from "@xstate/react";
import layerEditorMachine from "./machines/layerEditorMachine";
import SourceForm, { SourceFormType } from "./forms/SourceForm";
import LegendForm, { LegendsFormType } from "./forms/LegendsForm";
import InteractionForm from "./forms/InteractionForm";
import RenderForm from "./forms/RenderForm";
import { useState } from "react";
import { Map } from "react-map-gl";

export function BuildALayer() {
  const [current, send] = useMachine(layerEditorMachine);
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 1,
  });
  return (
    <>
      <Steps state={current.toStrings()[0] ?? "setSource"} />
      <div className="grid grid-cols-2">
        <div>
          {current.matches("setSource") && (
            <SourceForm
              onNext={(data: SourceFormType) => {
                send({ type: "sourceUpdate", data });
                send("NEXT");
              }}
              defaultValues={current.context.source}
            />
          )}
          {current.matches("setLegendConfig") && (
            <LegendForm
              onNext={(data: LegendsFormType) => {
                send({ type: "legendsUpdate", data });
                send("NEXT");
              }}
              onPrev={() => send("PREV")}
            />
          )}
          {current.matches("setInteractionConfig") && (
            <InteractionForm
              onPrev={() => {
                send("PREV");
              }}
              onNext={() => {
                send("NEXT");
              }}
            />
          )}
          {current.matches("setRenderConfig") && (
            <RenderForm
              onPrev={() => {
                send("PREV");
              }}
              onNext={() => {
                send("NEXT");
              }}
            />
          )}
        </div>
        <div className="pt-4">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{
              height: "400px",
              minHeight: "400px",
            }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
          />
        </div>
      </div>
    </>
  );
}

const steps = [
  { name: "Source", state: "setSource" },
  { name: "Legend", state: "setLegendConfig" },
  { name: "Interaction", state: "setInteractionConfig" },
  { name: "Render", state: "setRenderConfig" },
];

function Steps({ state }: { state: string }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="flex w-full items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
              "relative w-full",
            )}
          >
            {step.state === state ? (
              <>
                <div
                  className="absolute inset-0 right-0 -z-10 flex items-center justify-end"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-[70%]  bg-blue-800" />
                </div>
                <div className="flex items-center gap-x-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800"
                    aria-current="step"
                  >
                    <span className="font-acumin text-lg font-normal text-white">
                      {stepIdx + 1}
                    </span>
                  </span>
                  <span className="bg-white pr-2 font-acumin text-base font-normal text-black">
                    {step.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 right-0 -z-10 flex items-center justify-end"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-[70%] bg-neutral-100" />
                </div>
                <div className="flex items-center gap-x-2">
                  <span className="group flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                    <span className="font-acumin text-lg font-normal text-neutral-400">
                      {stepIdx + 1}
                    </span>
                  </span>
                  <span className="bg-white pr-2 font-acumin text-base font-normal text-zinc-400">
                    {step.name}
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
