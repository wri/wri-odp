import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function DatasetHorizontalCard() {
  return (
    <Link href="/datasets/x">
      <div className="grid gap-y-3 border-b-2 border-wri-green bg-white p-5 shadow-wri transition hover:bg-slate-100 lg:grid-cols-5">
        <div className="col-span-full lg:col-span-4">
          <div className="pr-4">
            <p className="font-['Acumin Pro SemiCondensed'] text-xs font-bold uppercase leading-none tracking-wide text-wri-green">
              LAND AND CARBON LAB
            </p>
            <h3 className="font-['Acumin Pro SemiCondensed'] mt-2 text-xl font-bold text-stone-900">
              Title of the dataset goes here lorem ipsum.
            </h3>
            <p className="font-['Acumin Pro SemiCondensed'] text-base font-light text-stone-900">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
              porta sem malesuada magna mollis euismod. Aenean lacinia bibendum
              nulla sed consectetur. Nullam quis risus eget urna mollis ornare
              vel eu leo.
            </p>
            <div className="mt-[0.33rem] flex justify-start gap-x-3">
              <div className="flex flex-row items-center gap-x-1">
                <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                  2 Feb 2023
                </p>
              </div>
              <div className="flex items-center gap-x-1">
                <ClockIcon className="h-3 w-3 text-blue-800" />
                <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                  2020 - 2023
                </p>
              </div>
              <div className="flex items-center gap-x-1">
                <MapPinIcon className="h-3 w-3 text-blue-800" />
                <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                  Sub-Regional
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-start gap-x-3">
            <div className="flex justify-start gap-x-3 border-r border-black pr-3">
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
            <div className="rounded-full bg-stone-100 p-1">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="col-span-full w-full border-t border-stone-200 lg:col-span-1 lg:border-l lg:border-t-0">
          <div className="flex gap-[5px] pt-3 lg:flex-col lg:pl-5 lg:pt-0">
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
      </div>
    </Link>
  );
}
