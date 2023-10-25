import {
  ArrowUpRightIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  GlobeAltIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import { Button } from "../_shared/Button";
import {
  ArrowPathIcon,
  ClockIcon,
  FingerPrintIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export function DatasetHeader() {
  return (
    <div className="flex w-full flex-col font-acumin">
      <div className="my-4 flex items-center gap-x-3">
        <Button variant="outline">
          <ChevronLeftIcon className="mb-1 h-5 w-5" />
          Go back
        </Button>
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
        <h1 className="text-2xl font-bold text-black">
          Title of the dataset goes here lorem ipsum
        </h1>
        <p className=" text-base font-light leading-snug text-stone-900">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta
          sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed
          consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="flex gap-x-1">
            <FingerPrintIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
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
              <div className="text-sm font-semibold text-neutral-700">
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
              <div className="text-sm font-semibold text-neutral-700">
                Temporal Coverage
              </div>
              <div className="text-sm font-light text-stone-900">
                2020 - 2023
              </div>
            </div>
          </div>
          <div className="flex gap-x-1">
            <MapPinIcon className="h-5 w-5 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
                Location
              </div>
              <div className="text-sm font-light text-stone-900">
                Sub-Regional
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-x-2 pb-10">
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
  );
}
