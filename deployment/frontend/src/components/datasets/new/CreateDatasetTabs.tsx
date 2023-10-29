import classNames from "@/utils/classnames";
import { CheckIcon } from "@heroicons/react/20/solid";
import { match } from "ts-pattern";

export function CreateDatasetTabs({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, name: "Metadata", href: "#" },
    { id: 2, name: "Datafiles", href: "#" },
    { id: 3, name: "Preview", href: "#" },
  ].map((step) => {
    return match(step.id - currentStep)
      .with(0, () => ({ ...step, status: "current" }))
      .with(1, () => ({ ...step, status: "upcoming" }))
      .otherwise(() => ({ ...step, status: "complete" }));
  });

  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="relative isolate h-16 divide-y divide-gray-300 rounded-md md:flex md:divide-y-0 xl:w-[85%] xxl:w-[90%]"
      >
        {match(currentStep)
          .with(1, () => (
            <img
              src="/images/caret_steps/step_1.svg"
              alt=""
              className="absolute inset-0 -z-10 hidden h-full w-full object-fill md:block"
            />
          ))
          .with(2, () => (
            <img
              src="/images/caret_steps/step_2.svg"
              alt=""
              className="absolute inset-0 -z-10 hidden h-full w-full object-fill md:block"
            />
          ))
          .with(3, () => (
            <img
              src="/images/caret_steps/step_3.svg"
              alt=""
              className="absolute inset-0 -z-10 hidden h-full w-full object-fill md:block"
            />
          ))
          .otherwise(() => (
            <></>
          ))}
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className="relative h-full items-center md:flex md:w-1/3"
          >
            {step.status === "current" && (
              <div className="absolute top-0 -left-5 h-[1px] w-[97%] shadow" />
            )}
            {step.status === "complete" ? (
              <a
                href={step.href}
                className="group flex h-full w-full items-center gap-x-2 px-6"
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
                className="group flex h-full w-full items-center gap-x-2 px-6"
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
                className="group flex h-full w-full items-center gap-x-2 px-6"
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
            {step.status === "current" && (
              <div className="absolute bottom-0 h-[1px] w-[98%] shadow" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
