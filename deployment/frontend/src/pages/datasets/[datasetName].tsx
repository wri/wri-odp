import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { DatasetHeader } from "@/components/datasets/DatasetHeader";
import DatasetPageLayout from "@/components/datasets/DatasetPageLayout";
import { DatasetTabs } from "@/components/datasets/DatasetTabs";
import { API } from "@/components/datasets/sections/API";
import { About } from "@/components/datasets/sections/About";
import { Contact } from "@/components/datasets/sections/Contact";
import { DataFiles } from "@/components/datasets/sections/DataFiles";
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
  ];
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <DatasetPageLayout>
        <DatasetHeader />
        <Tab.Group>
          <Tab.List as="nav" className="mb-4 flex border-b border-zinc-300 max-w-[95%]">
            <DatasetTabs tabs={tabs} />
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel><DataFiles /></Tab.Panel>
            <Tab.Panel><About /></Tab.Panel>
            <Tab.Panel><Methodology /></Tab.Panel>
            <Tab.Panel><RelatedDatasets /></Tab.Panel>
            <Tab.Panel><Contact /></Tab.Panel>
            <Tab.Panel><API /></Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </DatasetPageLayout>
    </>
  );
}
