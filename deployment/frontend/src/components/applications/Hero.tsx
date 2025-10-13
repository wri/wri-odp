import Image from 'next/image'
import { Button } from '../_shared/Button'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { type Application, GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { api } from '@/utils/api'
import {
    ArrowTurnLeftUpIcon,
    ArrowUpRightIcon,
} from '@heroicons/react/24/solid'

export function Hero({ application }: { application: Application }) {
    const { data: session } = useSession()
    return (
        <div className="mx-auto mb-8 mt-10 grid max-w-[1440px] font-acumin lg:mb-16 lg:max-h-[18.5rem] lg:grid-cols-5">
            <div className="relative h-[18.5rem] lg:col-span-2">
                <Image
                    alt="Application name"
                    fill={true}
                    src={`${
                        application.image_display_url !== ''
                            ? application?.image_display_url
                            : '/images/placeholders/applications/applicationsdefault.png'
                    }`}
                    className="object-cover"
                />
                <div className="absolute bottom-0 z-10 flex lg:h-[68px] lg:w-60 px-4 py-4 items-center justify-center rounded-t-[3px] bg-white">
                    <Link
                        href="/applications"
                        className="whitespace-nowrap inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500 h-11 px-6 py-4 rounded-[3px] text-base"
                    >
                        <ChevronLeftIcon className="mb-1 lg:mr-1 h-6 w-6" />
                        <span>See all Applications</span>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-y-1 px-4 py-6 lg:col-span-3">
                <div className="text-[33px] font-bold text-black">
                    {application.title}
                </div>
                <p className="max-w-[578.85px] text-lg font-light text-black">
                    {application?.description}{' '}
                    <a
                        href={application.contact_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline "
                    >
                        Contact the {application.title ?? application.name} Team
                    </a>
                </p>
                <div className="flex items-center gap-3">
                    <div className="text-base font-light text-black">
                        {application.package_count} associated Dataset
                        {application.package_count > 1 ? 's' : ''}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="mt-3">
                        <a
                            href={application.homepage_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1"
                        >
                            Open Application{' '}
                            <ArrowUpRightIcon className="h-5 w-5" />
                        </a>
                    </Button>
                    <Button className="mt-3" variant="outline">
                        <a
                            href={application.help_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1"
                        >
                            Visit Guide <ArrowUpRightIcon className="h-5 w-5" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
