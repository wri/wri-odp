import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

export function DatasetTabs({ tabs }: { tabs: { name: string }[] }) {
  return (
    <>
      {tabs.map((tab) => (
        <Tab as={Fragment}>
          {({ selected }: { selected: boolean }) => (
            <button
              className={classNames(
                selected
                  ? "border-wri-green text-wri-green"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition",
              )}
            >
              {tab.name}
            </button>
          )}
        </Tab>
      ))}
    </>
  );
}
