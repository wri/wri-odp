import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import { Button } from "@/components/_shared/Button";
import Header from "@/components/_shared/Header";
import { CreateDatasetTabs } from "@/components/datasets/admin/CreateDatasetTabs";
import { CreateDataFilesSection } from "@/components/datasets/admin/datafiles/CreateDatafilesSection";
import { CustomFieldsForm } from "@/components/datasets/admin/metadata/CustomFields";
import { DescriptionForm } from "@/components/datasets/admin/metadata/DescriptionForm";
import { MoreDetailsForm } from "@/components/datasets/admin/metadata/MoreDetails";
import { OverviewForm } from "@/components/datasets/admin/metadata/Overview";
import { PointOfContactForm } from "@/components/datasets/admin/metadata/PointOfContact";
import { Preview } from "@/components/datasets/admin/preview/Preview";
import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { match } from "ts-pattern";

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
        <div className={classNames("flex-col sm:flex-row gap-y-4 mx-auto flex w-full max-w-[1380px] justify-between font-acumin text-2xl font-semibold text-black px-4 xl:px-0", selectedIndex === 2 ? "max-w-[71rem] xxl:px-0" : "")}>
          <Button variant="muted" className="w-fit">Save as Draft</Button>
          <div className="flex items-center gap-x-2">
            <Button variant="outline">Cancel</Button>
            {selectedIndex !== 2 && (
              <Button onClick={() => setSelectedIndex(selectedIndex + 1)}>
                Next:{" "}
                {match(selectedIndex)
                  .with(0, () => "Datafiles")
                  .otherwise(() => "Preview")}
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
