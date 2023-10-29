import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { DatasetHeader } from "@/components/datasets/DatasetHeader";
import DatasetPageLayout from "@/components/datasets/DatasetPageLayout";
import { DatasetTabs } from "@/components/datasets/DatasetTabs";
import { API } from "@/components/datasets/sections/API";
import { About } from "@/components/datasets/sections/About";
import { Contact } from "@/components/datasets/sections/Contact";
import { DataFiles } from "@/components/datasets/sections/DataFiles";
import { Members } from "@/components/datasets/sections/Members";
import { Methodology } from "@/components/datasets/sections/Methodology";
import { RelatedDatasets } from "@/components/datasets/sections/RelatedDatasets";
import { Tab } from "@headlessui/react";
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
    { name: "API" },
    { name: "Members" },
  ];
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <DatasetPageLayout>
        <DatasetHeader />
        <Tab.Group>
          <Tab.List as="nav" className="flex w-full gap-x-2 @sm:pr-8 pr-4">
            <DatasetTabs tabs={tabs} />
          </Tab.List>
          <div className="mb-4 mr-9 border-b border-zinc-300" />
          <div className="@sm:pr-8 pr-4">
            <Tab.Panels>
              <Tab.Panel>
                <DataFiles />
              </Tab.Panel>
              <Tab.Panel>
                <About />
              </Tab.Panel>
              <Tab.Panel>
                <Methodology />
              </Tab.Panel>
              <Tab.Panel>
                <RelatedDatasets />
              </Tab.Panel>
              <Tab.Panel>
                <Contact />
              </Tab.Panel>
              <Tab.Panel>
                <API />
              </Tab.Panel>
              <Tab.Panel>
                <Members />
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
      </DatasetPageLayout>
    </>
  );
}