import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { match } from "ts-pattern";

export function CreateDatasetTabs({ currentStep }: { currentStep: number }) {
  console.log(currentStep)
  const steps = [
    { id: 0, name: "Metadata", href: "#" },
    { id: 1, name: "Datafiles", href: "#" },
    { id: 2, name: "Preview", href: "#" },
  ].map((step) => {
    return match(step.id - currentStep)
      .with(0, () => ({ ...step, status: "current" }))
      .with(1, () => ({ ...step, status: "upcoming" }))
      .with(2, () => ({ ...step, status: "upcoming" }))
      .otherwise(() => ({ ...step, status: "complete" }));
  });

  return (
    <Tab.List
      as="ol"
      className="relative isolate h-full w-[90%] max-w-[82rem] divide-y divide-gray-300 rounded-md md:flex md:divide-y-0"
    >
      {steps.map((step, stepIdx) => (
        <Tab
          as="li"
          key={step.name}
          className="relative h-full items-center md:flex md:w-1/3"
        >
          {step.status === "complete" ? (
            <a
              href={step.href}
              className={classNames("h-16 group flex w-full items-center gap-x-2 px-6", "bg-neutral-100")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                <CheckIcon
                  className="h-3 w-3 text-stone-300"
                  aria-hidden="true"
                />
              </span>
              <span className="h-6 w-36 font-acumin text-lg font-normal text-stone-300">
                {step.name}
              </span>
            </a>
          ) : step.status === "current" ? (
            <a
              className={classNames("h-16 group flex w-full items-center gap-x-2 px-6", "bg-white shadow-sm")}
              href={step.href}
              aria-current="step"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-800 text-white">
                <span className="text-xs">{step.id}</span>
              </span>
              <span className="mt-1 text-right font-acumin text-lg font-semibold text-black">
                {step.name}
              </span>
            </a>
          ) : (
            <a
              href={step.href}
              className={classNames("h-16 group flex w-full items-center gap-x-2 px-6", "bg-neutral-100")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-white">
                  <span className="text-xs text-stone-300">{step.id}</span>
                </span>
              </span>
              <span className="h-6 w-36 font-acumin text-lg font-normal text-stone-300">
                {step.name}
              </span>
            </a>
          )}
        </Tab>
      ))}
    </Tab.List>
  );
}
