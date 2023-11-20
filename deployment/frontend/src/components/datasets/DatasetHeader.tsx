import {
    ArrowUpRightIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    TableCellsIcon,
} from '@heroicons/react/20/solid'
import { Button } from '../_shared/Button'
import {
    ArrowPathIcon,
    ClockIcon,
    FingerPrintIcon,
    LinkIcon,
    MapPinIcon,
    StarIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { OpenIn, WriDataset } from '@/schema/ckan.schema'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import classNames from '@/utils/classnames'
import { getFormatColor } from '@/utils/formatColors'
import { useSession } from 'next-auth/react'
import { DefaultTooltip } from '../_shared/Tooltip'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/router'

function OpenInButton({ open_in }: { open_in: OpenIn[] }) {
    const session = useSession()
    if (open_in.length === 0) return <></>
    if (open_in.length === 1 && !session.data?.user) {
        return (
            <Button>
                <a href={open_in[0]?.url} target="_blank" rel="noreferrer">
                    Open in {open_in[0]?.title}
                    <ArrowUpRightIcon className="mb-1 h-6 w-6" />
                </a>
            </Button>
        )
    }
    if (open_in.length === 1 && session.data?.user) {
        return (
            <a
                href={open_in[0]?.url}
                target="_blank"
                rel="noreferrer"
                className="flex gap-x-2 items-center text-center text-stone-900 text-base font-bold font-acumin"
            >
                Open in {open_in[0]?.title}
                <ArrowUpRightIcon className="mb-1 h-6 w-6" />
            </a>
        )
    }
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button as={Fragment}>
                    {session.data?.user ? (
                        <span className="pl-2 border-l border-gray-200 gap-x-1 cursor-pointer flex items-center text-center text-stone-900 text-base font-bold font-acumin">
                            Open in
                            <ArrowUpRightIcon className="mb-1 h-5 w-5" />
                        </span>
                    ) : (
                        <Button>
                            Open in
                            <ArrowUpRightIcon className="mb-1 h-6 w-6" />
                        </Button>
                    )}
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {open_in.map((item) => (
                            <Menu.Item key={item.url}>
                                {({ active }) => (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={classNames(
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm'
                                        )}
                                    >
                                        {item.title}
                                    </a>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export function DatasetHeader({ dataset }: { dataset?: WriDataset }) {
    const session = useSession()
    const created_at = new Date(dataset?.metadata_created ?? '')
    const last_updated = new Date(dataset?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    return (
        <div className="flex w-full flex-col pb-10 font-acumin">
            {!session.data?.user ? (
                <div className="my-4 flex items-center gap-x-3 px-4 sm:px-6">
                    <Link href="/search">
                        <Button variant="outline">
                            <ChevronLeftIcon className="mb-1 h-5 w-5" />
                            Go back
                        </Button>
                    </Link>
                    <OpenInButton open_in={dataset?.open_in ?? []} />
                </div>
            ) : (
                <div className="mb-4 flex justify-between gap-x-3 bg-white shadow sm:px-6 px-4 pb-4">
                    <div className="flex items-center gap-x-3">
                        <Link
                            className="flex gap-x-2 items-center text-center text-stone-900 text-base font-bold font-acumin"
                            href="/search"
                        >
                            <ChevronLeftIcon className="mb-1 h-5 w-5" />
                            Go back
                        </Link>
                        <OpenInButton open_in={dataset?.open_in ?? []} />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <DefaultTooltip
                            content="Add to favorites"
                            side="bottom"
                        >
                            <StarIcon className="cursor-pointer h-6 w-6" />
                        </DefaultTooltip>
                        <DefaultTooltip content="Edit" side="bottom">
                            <PencilSquareIcon className="cursor-pointer h-6 w-6 text-yellow-800" />
                        </DefaultTooltip>
                    </div>
                </div>
            )}
            <div className="px-4 sm:px-6">
                <div className="mb-4 flex justify-start gap-x-3">
                    <div
                        className="flex justify-start gap-x-3
            "
                    >
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
                <div className="flex max-w-[560px] flex-col gap-y-2">
                    <h2 className="text-xs font-bold uppercase leading-none tracking-wide text-green-700">
                        {dataset?.organization?.title ?? 'No Team'}
                    </h2>
                    <div className="flex items-center gap-x-3">
                        <h1 className="w-fit text-3xl font-bold text-black">
                            {dataset?.title ?? dataset?.name}{' '}
                        </h1>
                        {session?.data?.user && (
                            <span className="rounded-full h-fit text-sm lg:text-xs px-2 py-y border border-gray-400 capitalize">
                                {dataset?.visibility_type}
                            </span>
                        )}
                    </div>
                    <p className=" text-justify text-base font-light leading-snug text-stone-900">
                        {dataset?.short_description ?? 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-4 py-4">
                        <div className="flex gap-x-1">
                            <FingerPrintIcon className="h-5 w-5 text-blue-800" />
                            <div>
                                <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                    Created
                                </div>
                                <div className="text-sm font-light text-stone-900">
                                    {' '}
                                    {created_at.toLocaleDateString(
                                        'en-US',
                                        options
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-x-1">
                            <ArrowPathIcon className="h-5 w-5 text-blue-800" />
                            <div>
                                <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                    Last Updated
                                </div>
                                <div className="text-sm font-light text-stone-900">
                                    {' '}
                                    {last_updated.toLocaleDateString(
                                        'en-US',
                                        options
                                    )}
                                </div>
                            </div>
                        </div>
                        {dataset?.temporal_coverage_start ||
                        dataset?.temporal_coverage_end ? (
                            <div className="flex gap-x-1">
                                <ClockIcon className="h-5 w-5 text-blue-800" />
                                <div>
                                    <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                        Temporal coverage
                                    </div>
                                    <div className="text-sm font-light text-stone-900">
                                        {dataset?.temporal_coverage_start ?? ''}{' '}
                                        - {dataset?.temporal_coverage_end ?? ''}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                {dataset?.cautions && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-x-3 rounded-sm bg-cyan-700 bg-opacity-10 p-3">
                        <ExclamationTriangleIcon className="col-span-1 grow max-h-8 max-w-8 text-yellow-600 sm:h-12 sm:w-12" />
                        <div className="col-span-11">
                            <span className=" font-acumin text-sm font-semibold leading-none text-black">
                                Caution:{' '}
                            </span>
                            <div
                                className="prose max-w-none prose-sm pr-8 text-justify prose-a:text-wri-green"
                                dangerouslySetInnerHTML={{
                                    __html: dataset?.cautions ?? '',
                                }}
                            ></div>
                        </div>
                    </div>
                )}
                <div className="mt-4 flex justify-start gap-x-3">
                    {dataset?.wri_data ? (
                        <div className="flex items-center rounded-[3px] border border-blue-400 bg-blue-400">
                            <div className="px-2 font-acumin text-xs font-medium text-white">
                                WRI Data
                            </div>
                        </div>
                    ) : ''}
                    {dataset?.technical_notes ? (
                        <div className="flex items-center rounded-[3px] border border-green-500 bg-green-500">
                            <div className="px-2 font-acumin text-xs font-medium text-white">
                                RDI approved
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center rounded-[3px] border border-orange-400 bg-orange-400">
                            <div className="px-2 font-acumin text-xs font-medium text-white">
                                Awaiting RDI approval
                            </div>
                        </div>
                    )}
                    {dataset?.resources &&
                        dataset?.resources.filter((resource) => resource.format)
                            .length > 0 && (
                            <div className="flex gap-x-2 border-l border-zinc-300 pl-3">
                                {dataset?.resources
                                    .filter((resource) => resource.format)
                                    .map((resource) => (
                                        <span
                                            key={resource.id}
                                            className={classNames(
                                                'flex h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black',
                                                getFormatColor(
                                                    resource.format ?? ''
                                                )
                                            )}
                                        >
                                            <span className="my-auto">
                                                {resource.format?.toUpperCase()}
                                            </span>
                                        </span>
                                    ))}
                            </div>
                        )}
                </div>
                {dataset?.technical_notes && (
                    <a
                        href={dataset?.technical_notes}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-x-1 pt-4"
                    >
                        <LinkIcon className="h-4 w-4 text-wri-green" />
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                            Technical Notes
                        </div>
                    </a>
                )}
            </div>
        </div>
    )
}
