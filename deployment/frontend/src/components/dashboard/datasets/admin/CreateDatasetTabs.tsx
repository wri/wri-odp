import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { match } from "ts-pattern";

export function CreateDatasetTabs({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 0, name: "Metadata", href: "#" },
    { id: 1, name: "Datafiles", href: "#" },
    { id: 2, name: "Map Visualizations", href: "#" },
    { id: 3, name: "Preview", href: "#" },
  ].map((step) => {
    return match(step.id - currentStep)
      .with(0, () => ({ ...step, status: "current" }))
      .with(1, () => ({ ...step, status: "upcoming" }))
      .with(2, () => ({ ...step, status: "upcoming" }))
      .with(3, () => ({ ...step, status: "upcoming" }))
      .otherwise(() => ({ ...step, status: "complete" }));
  });

  return (
    <Tab.List
      as="nav"
      className="relative isolate h-full w-full md:w-[90%] md:max-w-[82rem] divide-y divide-gray-300 rounded-md md:flex md:divide-y-0"
    >
      {steps.map((step, stepIdx) => (
        <Tab
          as="div"
          key={step.name}
          className={classNames(
            "relative h-full items-center md:flex md:w-1/3",
            stepIdx === steps.length - 1
              ? "md:w-[calc(33%-64px)]"
              : "",
          )}
        >
          {step.status === "complete" ? (
            <div
              className={classNames(
                "group relative flex h-16 w-full items-center gap-x-2 px-6 xxl:px-8",
                "bg-neutral-100",
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                <CheckIcon
                  className="h-3 w-3 text-stone-300"
                  aria-hidden="true"
                />
              </span>
              <span className="h-6 w-36 font-acumin text-lg font-normal text-stone-600">
                {step.name}
              </span>
            </div>
          ) : step.status === "current" ? (
            <div
              className={classNames(
                "group relative isolate flex h-16 w-full items-center gap-x-2 px-6 xxl:px-8",
                "md:bg-neutral-100 bg-white shadow md:shadow-none",
              stepIdx === steps.length - 1 ? "md:bg-transparent" : ""
              )}
              aria-current="step"
            >
              <div
                className={classNames(
                  "hidden arrow-wrap absolute inset-0 -z-10 md:flex w-full",
                  stepIdx !== 0 ? "-ml-9" : "",
                  stepIdx === steps.length - 1 ? "w-[100%+64px]" : "",
                )}
              >
                {stepIdx !== 0 && (
                  <div className="arrow-left -z-[9] -mr-1 h-16 w-9 bg-white"></div>
                )}
                <div className="-z-10 h-16 grow bg-white"></div>
                <div className="arrow-right -z-[9] -ml-[1px] h-16 w-8 bg-white"></div>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-800 text-white">
                <span className="text-xs">{step.id + 1}</span>
              </span>
              <span className="mt-1 text-right font-acumin text-lg font-semibold text-black">
                {step.name}
              </span>
            </div>
          ) : (
            <div
              className={classNames(
                "group relative flex h-16 w-full items-center gap-x-2 px-6",
                "bg-neutral-100",
              )}
            >
              {stepIdx === steps.length - 1 && (
                <div
                  className={classNames(
                    "absolute z-8 hidden md:flex w-full justify-end",
                  )}
                >
                  <div className="arrow-left -mr-1 h-16 w-16 bg-white"></div>
                </div>
              )}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                  <span className="text-xs text-stone-300">{step.id}</span>
                </span>
              </span>
              <span className="h-6 w-36 font-acumin text-lg font-normal text-stone-600">
                {step.name}
              </span>
            </div>
          )}
        </Tab>
      ))}
    </Tab.List>
  );
}
