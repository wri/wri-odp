import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { CreateDatasetTabs } from "@/components/datasets/new/CreateDatasetTabs";
import { CreateDataFilesSection } from "@/components/datasets/new/datafiles/CreateDatafilesSection";
import { CustomFieldsForm } from "@/components/datasets/new/metadata/CustomFields";
import { DescriptionForm } from "@/components/datasets/new/metadata/Description";
import { MoreDetailsForm } from "@/components/datasets/new/metadata/MoreDetails";
import { OverviewForm } from "@/components/datasets/new/metadata/Overview";
import { PointOfContactForm } from "@/components/datasets/new/metadata/PointOfContact";
import { Preview } from "@/components/datasets/new/preview/Preview";
import { Tab } from "@headlessui/react";
import { useState } from "react";

const links = [
  { label: "Dashboard", url: "/dashboard", current: false },
  { label: "Add a Dataset", url: "/dashboard/datasets/new", current: true },
];

export default function NewDatasetPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <main className="flex flex-col justify-start gap-y-12 py-16">
        <h1 className="mx-auto w-full max-w-[1380px] px-4 font-acumin text-2xl font-semibold text-black sm:px-6 xxl:px-0">
          Add a dataset
        </h1>
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <CreateDatasetTabs currentStep={selectedIndex} />
          <Tab.Panels>
            <Tab.Panel as="div" className="flex flex-col gap-y-12">
              <OverviewForm />
              <DescriptionForm />
              <PointOfContactForm />
              <MoreDetailsForm />
              <CustomFieldsForm />
            </Tab.Panel>
            <Tab.Panel as="div" className="flex flex-col gap-y-12">
              <CreateDataFilesSection />
            </Tab.Panel>
            <Tab.Panel as="div" className="flex flex-col gap-y-12">
              <Preview />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </>
  );
}
