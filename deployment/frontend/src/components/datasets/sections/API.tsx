import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

const tabs = ["Python", "Javascript", "R", "Curl", "Pandas"];

export function API() {
  return (
    <Tab.Group as="div">
      <Tab.List
        as="nav"
        className="-mt-4 flex h-12 w-full items-center bg-neutral-100 font-acumin overflow-x-auto"
      >
        {tabs.map((tab) => (
          <Tab as={Fragment}>
            {({ selected }: { selected: boolean }) => (
              <button
                className={classNames(
                  selected
                    ? "rounded-sm border-b border-wri-green bg-white"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "h-full whitespace-nowrap px-10 text-center text-base font-normal capitalize text-neutral-800",
                )}
              >
                {tab}
              </button>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panel as="div" className="py-6 overflow-clip">
        <div className="font-acumin text-base font-normal text-zinc-800">
          For Python, first install the `datapackage` library.
        </div>
        <div className="rounded-sm border border-zinc-300 bg-white px-5 py-4">
          <pre className="font-acumin text-base font-light text-stone-500">
            <>
              {`pip install datapackage`}
            </>
          </pre>
        </div>
        <div className="font-acumin text-base font-normal text-zinc-800">
          To get this into your Python environment, run the following code:
        </div>
        <div className="rounded-sm border border-zinc-300 bg-white px-5 py-4">
          <pre className="font-acumin text-base font-light text-stone-500">
            <>
              {`from datapackage import Package 

package = 
Package('https://datahub.io/core/gdp/datapackage.json') 
# print list of all resources: 
print(package.resource_names) 
# print processed tabular data (if exists any) for resource in package.resources: 
if resource.descriptor['datahub']['type'] == 'derived/csv':
  print(resource.read())`}
            </>
          </pre>
        </div>
      </Tab.Panel>
    </Tab.Group>
  );
}
