import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

export interface SubtopicProps {
    title: string
    numOfDatasets: number
    img: string
}

export default function SubtopicCard({
    topic,
    topicsDetails,
}: {
    topic: GroupTree
    topicsDetails: Record<string, GroupsmDetails>
}) {
    console.log('img_url: ', topicsDetails[topic.id]?.img_url)
    return (
        <Link
            href={`/topics/${topic.name}`}
            className="flex flex-col w-full font-acumin gap-1"
        >
            <div className="relative w-full md:w-56 h-44">
                <Image
                    src={`${
                        topicsDetails[topic.id]?.img_url
                            ? topicsDetails[topic.id]?.img_url
                            : '/images/placeholders/topics/topicsdefault.png'
                    }`}
                    alt="higlight"
                    fill
                />
            </div>
            <div className="text-black text-lg font-normal">{topic.title}</div>
            <div className="text-black text-sm font-normal">
                {topicsDetails[topic.id]?.package_count} Datasets
            </div>
        </Link>
    )
}
