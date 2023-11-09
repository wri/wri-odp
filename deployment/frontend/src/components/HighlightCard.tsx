import React from "react";
import Image from "next/image";
import { ChartBarIcon, GlobeAltIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

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
    <Link href="/datasets/x" className="flex w-full flex-col font-acumin">
      <div className="relative h-56 w-full 2xl:h-64">
        <Image src={`${highlight.img}`} alt="higlight" fill />
      </div>
      <div className="z-10 -mt-6 w-[70%] bg-white pb-2 pt-4 text-[0.938rem] font-bold text-wri-green">
        FORESTS
      </div>
      <h2 className='text-wri-black text-2xl font-bold w-[80%]'>Title of the dataset goes here lorem ipsum.</h2>
      <article className=' line-clamp-3 w-[88%] font-light text-base mt-4 leading-[1.375rem]'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?</article>
      <div className='flex font-light text-sm text-wri-black mt-4 leading-[1.375rem] '>
        <div className='flex  '>
          <div className='w-4 h-4 relative'>
            <Image src='/icons/time.svg' alt="eye" fill />
          </div>
          <div className='ml-2 w-fit h-[14px]'>
            2020 - 2023
          </div>
        </div>
        <div className='border-l border-wri-black h-4  mx-2'></div>
        <div className='flex '>
          <div className='w-4 h-4 relative'>
            <Image src='/icons/Framelocation.svg' alt="comment" fill />
          </div>
          <div className='ml-1 w-fit h-[14px]'>
            Sub-regional
          </div>
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
    </Link>
  );
}
