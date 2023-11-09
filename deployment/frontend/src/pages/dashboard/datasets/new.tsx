import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import { Button } from "@/components/_shared/Button";
import Header from "@/components/_shared/Header";
import NewDatasetForm from "@/components/dashboard/datasets/admin/NewDatasetForm";
import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { match } from "ts-pattern";

const links = [
  { label: "Dashboard", url: "/dashboard", current: false },
  { label: "Datasets", url: "/dashboard/datasets", current: false },
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
        <NewDatasetForm />
      </main>
    </>
  );
}
