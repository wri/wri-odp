import {
  ArrowUpRightIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import { Button } from "../_shared/Button";
import {
  ArrowPathIcon,
  ClockIcon,
  FingerPrintIcon,
  LinkIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function DatasetHeader() {
  return (
    <div className="flex w-full flex-col pb-10 font-acumin">
      <div className="my-4 flex items-center gap-x-3">
        <Link href="/search">
          <Button variant="outline">
            <ChevronLeftIcon className="mb-1 h-5 w-5" />
            Go back
          </Button>
        </Link>
        <Button>
          Open in GFW
          <ArrowUpRightIcon className="mb-1 h-6 w-6" />
        </Button>
      </div>
      <div className="mb-4 flex justify-start gap-x-3">
        <div
          className="flex justify-start gap-x-3
            "
        >
          <div className="rounded-full bg-stone-100 p-1">
            <ChartBarIcon className="h-5 w-5 text-blue-700" />
          </div>
          <div className="rounded-full bg-stone-100 p-1">
            <GlobeAltIcon className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="rounded-full bg-stone-100 p-1">
            <TableCellsIcon className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>
      <div className="flex max-w-[560px] flex-col gap-y-2">
        <h2 className="text-xs font-bold uppercase leading-none tracking-wide text-green-700">
          LAND AND CARBON LAB
        </h2>
        <h1 className="text-3xl font-bold text-black">
          Title of the dataset goes here lorem ipsum
        </h1>
        <p className=" text-justify text-base font-light leading-snug text-stone-900">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta
          sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed
          consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.
        </p>
        <div className="flex flex-wrap gap-4 py-4">
          <div className="flex gap-x-1">
            <FingerPrintIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                Created
              </div>
              <div className="text-sm font-light text-stone-900">
                {" "}
                2 Feb 2023
              </div>
            </div>
          </div>
          <div className="flex gap-x-1">
            <ArrowPathIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                Last Updated
              </div>
              <div className="text-sm font-light text-stone-900">
                {" "}
                2 Feb 2023
              </div>
            </div>
          </div>
          <div className="flex gap-x-1">
            <ClockIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                Temporal coverage
              </div>
              <div className="text-sm font-light text-stone-900">
                2020 - 2023
              </div>
            </div>
          </div>
          <div className="flex gap-x-1">
            <MapPinIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                Location
              </div>
              <div className="text-sm font-light text-stone-900">
                Sub-Regional
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-x-3 rounded-sm bg-cyan-700 bg-opacity-10 p-3 lg:flex-row">
        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 sm:h-12 sm:w-12" />
        <p>
          <span className="font-acumin text-sm font-semibold leading-none text-black">
            Caution:{" "}
          </span>
          <span className="text-sm font-light text-black">
            Data set is not for use in litigation. While efforts have been made
            to ensure that these data are accurate and reliable within the state
            of the art, WRI, cannot assume liability.{" "}
          </span>
          <a
            href="#"
            className="font-acumin text-sm font-normal leading-none text-wri-green underline"
          >
            Read more
          </a>
        </p>
      </div>
      <div className="mt-4 flex justify-start gap-x-3">
        <div className="flex items-center rounded-[3px] border border-green-500 bg-green-500">
          <div className="px-2 font-acumin text-xs font-medium text-white">
            RDI approved
          </div>
        </div>
        <div className="flex gap-x-2 border-l border-zinc-300 pl-3">
          <span className="flex h-7 w-fit items-center justify-center rounded-sm bg-wri-light-green px-3 text-center text-xs font-normal text-black">
            <span className="my-auto">TIFF</span>
          </span>
          <span className="flex h-7 w-fit items-center justify-center rounded-sm bg-wri-light-yellow px-3 text-center text-xs font-normal text-black">
            <span className="my-auto">CSV</span>
          </span>
          <span className="flex h-7 w-fit items-center justify-center rounded-sm bg-wri-light-blue px-3 text-center text-xs font-normal text-black">
            <span className="my-auto">GeoJSON</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-x-1 pt-4">
        <LinkIcon className="h-4 w-4 text-wri-green" />
        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
          Technical Notes
        </div>
      </div>
    </div>
  );
}
