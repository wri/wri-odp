import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import Header from "@/components/_shared/Header";
import { CustomFieldsForm } from "@/components/datasets/new/metadata/CustomFields";
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
      <main className="py-16 flex flex-col gap-y-12 justify-start">
        <h1 className="max-w-[1380px] mx-auto w-full px-4 sm:px-6 xxl:px-0 text-black text-2xl font-semibold font-acumin">Add a dataset</h1>
        <OverviewForm />
        <PointOfContactForm />
        <MoreDetailsForm />
        <CustomFieldsForm />
      </main>
    </>
  );
}
