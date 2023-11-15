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
      <div className="grid lg:grid-cols-2">
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
              width:"100%",
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
    <>
    <div className="lg:hidden px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="flex justify-start" aria-label="Progress">
        <ol role="list" className="space-y-6">
          {steps.map((step) => (
            <li key={step.name}>
              {step.state === state ? (
                <span className="flex items-start" aria-current="step">
                  <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
                    <span className="absolute h-4 w-4 rounded-full bg-blue-200" />
                    <span className="relative block h-2 w-2 rounded-full bg-blue-800" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-blue-800">{step.name}</span>
                </span>
              ) : (
                <span className="group">
                  <div className="flex items-start">
                    <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
                      <div className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</p>
                  </div>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
    <nav aria-label="Progress" className="w-full hidden lg:block">
      <ol role="list" className="flex w-full items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "w-full pr-8 sm:pr-20" : "",
              "relative",
            )}
          >
            {step.state === state ? (
              <>
                <div
                  className="absolute inset-0 right-0 -z-10 flex items-center justify-end"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-[100%]  bg-blue-800" />
                </div>
                <div
                  className={classNames(
                    "flex w-fit items-center gap-x-2 bg-white",
                    stepIdx === steps.length - 1 ? "justify-end" : "",
                  )}
                >
                  <div
                    className={classNames(
                      stepIdx !== 0 ? "pl-4" : "",
                      "bg-white",
                    )}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800"
                      aria-current="step"
                    >
                      <span className="font-acumin text-lg font-normal text-white">
                        {stepIdx + 1}
                      </span>
                    </span>
                  </div>
                  <span
                    className={classNames(
                      "bg-white font-acumin text-base font-normal text-black",
                      stepIdx !== steps.length - 1 ? "pr-4" : "",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute inset-0 right-0 -z-10 flex w-full items-center justify-end"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-[100%] bg-neutral-100" />
                  </div>
                )}
                <div
                  className={classNames(
                    "flex w-fit items-center gap-x-2 bg-white",
                    stepIdx === steps.length - 1 ? "justify-end" : "",
                  )}
                >
                  <div
                    className={classNames(
                      stepIdx !== 0 ? "pl-4" : "",
                      "bg-white",
                    )}
                  >
                    <span className="group flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                      <span className="font-acumin text-lg font-normal text-neutral-400">
                        {stepIdx + 1}
                      </span>
                    </span>
                  </div>
                  <span
                    className={classNames(
                      "bg-white font-acumin text-base font-normal text-zinc-400",
                      stepIdx !== steps.length - 1 ? "pr-6" : "",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </>
  );
}
