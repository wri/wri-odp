import React from "react";
import Image from "next/image";
import { ChartBarIcon, GlobeAltIcon, TableCellsIcon } from "@heroicons/react/20/solid";

export interface HiglightProps {
  title: string;
  description: string;
  date: string;
  location: string;
  tag: string;
  img: string;
}

export default function HighlightCard({
  highlight,
}: {
  highlight: HiglightProps;
}) {
  return (
    <div className="flex w-full flex-col font-acumin">
      <div className="relative h-56 w-full 2xl:h-64">
        <Image src={`${highlight.img}`} alt="higlight" fill />
      </div>
      <div className="z-10 -mt-6 w-[70%] bg-white pb-2 pt-4 text-[0.938rem] font-bold text-wri-green">
        FORESTS
      </div>
      <h2 className="w-[80%] text-2xl font-bold text-wri-black">
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
          <Image src="/icons/time.svg" alt="eye" width={15} height={15} />
          <span className="ml-2">2020 - 2023</span>
        </div>
        <div className="mx-2 h-4 border-l  border-wri-black"></div>
        <div className="flex items-center">
          <Image
            src="/icons/Framelocation.svg"
            alt="comment"
            width={15}
            height={15}
          />
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
