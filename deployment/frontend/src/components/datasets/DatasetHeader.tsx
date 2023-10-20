import { ArrowUpRightIcon, ChartBarIcon, ChevronLeftIcon, GlobeAltIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { Button } from "../_shared/Button";

export function DatasetHeader() {
  return (
    <div className="flex w-full flex-col font-acumin">
      <div className="my-4 flex items-center gap-x-3">
        <Button variant="outline">
          <ChevronLeftIcon className="h-5 w-5" />
          Go back
        </Button>
        <Button>
          Open in GFW
          <ArrowUpRightIcon className="h-5 w-5" />
        </Button>
      </div>
        <div className="mb-4 flex justify-start gap-x-3">
          <div className="flex justify-start gap-x-3
            ">
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
      <div className="flex flex-col gap-y-2">
      <h2 className="text-xs font-bold uppercase leading-none tracking-wide text-green-700">
        LAND AND CARBON LAB
      </h2>
      <h1 className="text-2xl font-bold text-black">
        Title of the dataset goes here lorem ipsum
      </h1>
      <p className=" text-base font-light leading-snug text-stone-900">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem
        malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed
        consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.
      </p></div>
    </div>
  );
}
