import React from 'react'
import Image from 'next/image'
import Topic from '@/interfaces/topic.interface'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

export default function TopicCard({
    topic,
    topicDetails,
}: {
    topic: GroupTree
    topicDetails: Record<string, GroupsmDetails>
}) {
    return (
        <a
            href={`/topics/${topic.name}`}
            className="text-wri-black flex flex-col w-full font-acumin max-w-[400px] ml-auto mr-auto"
        >
            <div className="relative w-full h-56 2xl:h-64">
                <Image
                    src={`${
                        topicDetails[topic.id]?.img_url
                            ? topicDetails[topic.id]?.img_url
                            : '/images/placeholders/topics/topicsdefault.png'
                    }`}
                    alt={`Topic - ${topic.title}`}
                    fill
                    className="object-contain"
                />
            </div>
            <div className="bg-white w-[70%] pt-2 -ml-[1px] -mt-6 z-10 line-clamp-2 h-16 pb-1.5">
                <h2 className="text-2xl font-bold w-[80%]">{topic.title}</h2>
            </div>
            <article className=" line-clamp-3 w-[88%] font-light text-base mt-2 leading-[1.375rem] line-clamp-3 h-16">
                {topicDetails[topic.id]?.description}
            </article>
            <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
                <span className="mr-2">
                    {topicDetails[topic.id]?.package_count} datasets
                </span>
                <div className="border-l border-wri-black h-4  mx-2"></div>
                <span className="ml-2">{topic.children.length} Subtopics</span>
            </div>
        </a>
    )
}
