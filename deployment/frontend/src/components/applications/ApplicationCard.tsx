import React from 'react'
import Image from 'next/image'
import { Application } from '@/schema/ckan.schema'
import { api } from '@/utils/api'
import Link from 'next/link'

export default function ApplicationCard({
    application,
}: {
    application: Application
}) {
    return (
        <Link
            href={`/applications/${application.name}`}
            className="text-wri-black flex flex-col w-full font-acumin max-w-[400px] ml-auto mr-auto"
        >
            <div className="relative w-full h-56 2xl:h-64">
                <Image
                    src={`${
                        application.image_display_url !== ''
                            ? application?.image_display_url
                            : '/images/placeholders/applications/applicationsdefault.png'
                    }`}
                    alt={`Application - ${application.title}`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="bg-white w-[70%] pt-2 -ml-[1px] -mt-6 z-10 line-clamp-2 h-16 pb-1.5">
                <h2 className="text-2xl font-bold w-[80%]">
                    {application.title}
                </h2>
            </div>
            <article className=" w-[88%] font-light text-base mt-2 leading-[1.375rem] line-clamp-3 h-16">
                application.description
            </article>
            <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
                <span className="mr-2">
                    {application.package_count}
                    {" "}datasets
                </span>
            </div>
        </Link>
    )
}
