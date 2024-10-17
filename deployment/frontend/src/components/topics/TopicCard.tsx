import React from 'react'
import Image from 'next/image'
import Topic from '@/interfaces/topic.interface'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { Group } from '@portaljs/ckan'
import { api } from '@/utils/api'
import Link from 'next/link'

//write a typeguard to check if the topic is a GroupTree
function isGroupTree(topic: GroupTree | Group): topic is GroupTree {
    return (topic as GroupTree).children !== undefined
}

export default function TopicCard({
    topic,
    topicDetails,
}: {
    topic: GroupTree | (Group & { numSubtopics: number })
    topicDetails: Record<string, GroupsmDetails>
}) {
    const { data: numOfSubtopics } = api.topics.getNumberOfSubtopics.useQuery()
    return (
        <Link
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
                    className="object-cover"
                />
            </div>
            <div className="bg-white w-[70%] pt-2 -ml-[1px] -mt-6 z-10 line-clamp-2 h-16 pb-1.5">
                <h2 className="text-2xl font-bold w-[80%]">{topic.title}</h2>
            </div>
            <article className=" w-[88%] font-light text-base mt-2 leading-[1.375rem] line-clamp-3 h-16">
                {isGroupTree(topic)
                    ? topicDetails[topic.id]?.description
                    : topic.description}
            </article>
            <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
                <span className="mr-2">
                    {isGroupTree(topic)
                        ? topicDetails[topic.id]?.package_count
                        : topic.package_count}{' '}
                    datasets
                </span>
                {isGroupTree(topic) && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {topic.children.length} Subtopics
                        </span>
                    </>
                )}
                {!isGroupTree(topic) && numOfSubtopics && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {
                                //@ts-ignore
                                numOfSubtopics[topic.name]
                            }{' '}
                            Subtopics
                        </span>
                    </>
                )}
            </div>
        </Link>
    )
}
