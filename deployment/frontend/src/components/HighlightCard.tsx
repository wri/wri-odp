import React from 'react'
import Image from 'next/image'
import {
    ChartBarIcon,
    GlobeAltIcon,
    TableCellsIcon,
} from '@heroicons/react/20/solid'
import Link from 'next/link'
import { WriDataset } from '@/schema/ckan.schema'

export default function HighlightCard({
    highlight,
}: {
    highlight: WriDataset
}) {
    console.log(highlight.featured_image)
    return (
        <Link href="/datasets/x" className="flex w-full flex-col font-acumin">
            <div className="relative h-56 w-full 2xl:h-64">
                <Image
                    src={highlight?.featured_image ?? `/images/map.png`}
                    alt="higlight"
                    fill
                    className='object-cover'
                />
            </div>
            <div className="z-10 -mt-6 w-[70%] bg-white pb-2 pt-4 text-[0.938rem] font-bold text-wri-green line-clamp-1 h-[3em]">
                {highlight.organization?.title}
            </div>
            <h2 className="text-wri-black text-2xl font-bold w-[80%] line-clamp-2 h-[2.5em]">
                {highlight.title ?? highlight.name}
            </h2>
            <article className=" line-clamp-3 w-[88%] font-light text-base mt-4 leading-[1.375rem] line-clamp-3 h-[4em]">
                {highlight.short_description ?? highlight.notes}
            </article>
            <div className="flex font-light text-sm text-wri-black mt-4 leading-[1.375rem] h-3">
                {highlight.temporal_coverage_start ||
                highlight.temporal_coverage_end ? (
                    <div className="flex  ">
                        <div className="w-4 h-4 relative">
                            <Image src="/icons/time.svg" alt="eye" fill />
                        </div>
                        <div className="ml-2 w-fit h-[14px]">
                            {highlight.temporal_coverage_start ?? '?'} -{' '}
                            {highlight.temporal_coverage_end ?? ''}
                        </div>
                    </div>
                ) : null}
                {(highlight as any).location &&
                (highlight.temporal_coverage_start ||
                    highlight.temporal_coverage_end) ? (
                    <div className="border-l border-wri-black h-4  mx-2"></div>
                ) : null}
                {(highlight as any).location ? (
                    <div className="flex ">
                        <div className="w-4 h-4 relative">
                            <Image
                                src="/icons/Framelocation.svg"
                                alt="comment"
                                fill
                            />
                        </div>
                        <div className="ml-1 w-fit h-[14px]">Sub-regional</div>
                    </div>
                ) : null}
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
    )
}
