import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

const tabs = [
  'Python',
  'Javascript',
  'R',
  'Curl',
  'Pandas'
]

export function API() {
  return (
    <Tab.Group>
      <Tab.List as="nav" className="h-12 bg-neutral-100 font-acumin flex items-center -mt-4 w-full">
        {tabs.map((tab) => (
        <Tab as={Fragment}>
          {({ selected }: { selected: boolean }) => (
            <button
              className={classNames(
                selected
                  ? "bg-white rounded-sm border-b border-wri-green"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "px-10 h-full whitespace-nowrap text-center text-neutral-800 text-base font-normal capitalize",
              )}
            >
              {tab}
            </button>
          )}
        </Tab>
        )
        )}</Tab.List>
    </Tab.Group>
  );
}
