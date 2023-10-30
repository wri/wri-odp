import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { CreateDatasetTabs } from "@/components/datasets/new/CreateDatasetTabs";
import { CustomFieldsForm } from "@/components/datasets/new/metadata/CustomFields";
import { DescriptionForm } from "@/components/datasets/new/metadata/Description";
import { MoreDetailsForm } from "@/components/datasets/new/metadata/MoreDetails";
import { OverviewForm } from "@/components/datasets/new/metadata/Overview";
import { PointOfContactForm } from "@/components/datasets/new/metadata/PointOfContact";

const links = [
  { label: "Dashboard", url: "/dashboard", current: false },
  { label: "Add a Dataset", url: "/dashboard/datasets/new", current: true },
];

export default function NewDatasetPage() {
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <main className="flex flex-col justify-start gap-y-12 py-16">
        <h1 className="mx-auto w-full max-w-[1380px] px-4 font-acumin text-2xl font-semibold text-black sm:px-6 xxl:px-0">
          Add a dataset
        </h1>
        <CreateDatasetTabs currentStep={1} />
        <OverviewForm />
        <DescriptionForm />
        <PointOfContactForm />
        <MoreDetailsForm />
        <CustomFieldsForm />
      </main>
    </>
  );
}
