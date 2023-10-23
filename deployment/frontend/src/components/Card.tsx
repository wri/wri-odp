import React from "react";
import {
  ChartBarIcon,
  GlobeAltIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function Card() {
  return (
    <div className="flex w-full flex-col border-b-2 border-b-wri-green p-4 pb-6 font-acumin shadow">
      <div className="w-full bg-white pb-2 pt-4 text-[0.938rem] font-bold leading-[1.125rem] text-wri-green">
        LAND AND CARBON LAB
      </div>
      <h2 className="w-full text-2xl font-bold text-wri-black">
        Title of the dataset goes here lorem ipsum.
      </h2>
      <article className=" mt-4 line-clamp-3 w-[88%] text-base font-light leading-[1.375rem]">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore
        maxime ut aspernatur laborum quod architecto, repellat commodi, iure
        suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore
        incidunt odit reprehenderit?
      </article>
      <div className="mt-4 flex text-sm font-light leading-[1.375rem] text-wri-black">
        <div className="flex items-center">
          <ClockIcon className="h-3 w-3 text-blue-800 mb-1" />
          <span className="ml-2">2020 - 2023</span>
        </div>
        <div className="mx-2 h-4 border-l  border-wri-black"></div>
        <div className="flex items-center">
          <MapPinIcon className="h-3 w-3 text-blue-800 mb-1" />
          <span className="ml-2">Sub-regional</span>
        </div>
      </div>
      <div className="mt-4 flex gap-x-2 text-sm font-light leading-[1.375rem] text-wri-black">
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
  );
}
