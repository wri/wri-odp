import React from 'react'
import Image from 'next/image'
import { type Application } from '@/schema/ckan.schema'
import { api } from '@/utils/api'
import Link from 'next/link'

export default function ApplicationCard({
    application,
}: {
    application: Application
}) {
    const datasetCount = application.package_count
    return (
        <Link
            href={`/applications/${application.name}`}
            className="flex w-full flex-col gap-2 font-acumin pb-6"
        >
            <div className="relative aspect-square h-72 w-full bg-white">
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
            <p className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black pt-2">
                {application.title}
            </p>
            <p className="font-['Acumin Pro SemiCondensed'] w-24 text-base font-semibold text-green-700">
                {datasetCount && datasetCount > 1
                    ? `${datasetCount} Datasets`
                    : `${datasetCount} Dataset`}
            </p>
        </Link>
    )
}
