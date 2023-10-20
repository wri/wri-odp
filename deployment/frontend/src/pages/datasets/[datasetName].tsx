import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { DatasetHeader } from "@/components/datasets/DatasetHeader";
import DatasetPageLayout from "@/components/datasets/DatasetPageLayout";
import { About } from "@/components/datasets/sections/About";
import { DataFiles } from "@/components/datasets/sections/DataFiles";
import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

const links = [
  { label: "Explore Data", url: "/search", current: false },
  { label: "Name of dataset", url: "/datasets/dataset_test", current: true },
];

export default function DatasetPage() {
  const tabs = [
    { name: "Data files" },
    { name: "About" },
    { name: "Methodology" },
    { name: "Related Datasets" },
    { name: "Contact" },
  ];
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <DatasetPageLayout>
        <DatasetHeader />
        <Tab.Group>
          <Tab.List as="nav" className="-mb-px flex py-4">
            {tabs.map((tab) => (
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={classNames(
                      selected
                        ? "border-wri-green text-wri-green"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 px-4 font-semibold font-acumin",
                    )}
                  >
                    {tab.name}
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel><DataFiles /></Tab.Panel>
            <Tab.Panel><About /></Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </DatasetPageLayout>
    </>
  );
}
