import { Button } from '@/components/_shared/Button'
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
});
import { Tab } from '@headlessui/react'
import {
    ArrowPathIcon,
    ArrowTopRightOnSquareIcon,
    ClockIcon,
    FingerPrintIcon,
    LightBulbIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { DatasetTabs } from '../../DatasetTabs'
import { WriDataset } from '@/schema/ckan.schema'
import { Resource } from '@/interfaces/dataset.interface'
import classNames from '@/utils/classnames'
import { getFormatColor } from '@/utils/formatColors'

export function LearnMoreButton({
    dataset,
    datafile,
}: {
    dataset: WriDataset
    datafile: Resource
}) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex aspect-square w-full flex-col items-center justify-center rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400 md:gap-y-2"
            >
                <LightBulbIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                <div className="font-acumin text-xs font-normal text-black sm:text-sm">
                    Learn More
                </div>
                <div className="h-4 font-acumin text-xs font-normal text-black"></div>
            </button>
            <LearnMoreModal
                open={open}
                setOpen={setOpen}
                dataset={dataset}
                datafile={datafile}
            />
        </>
    )
}

function LearnMoreModal({
    open,
    setOpen,
    dataset,
    datafile,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    dataset: WriDataset
    datafile: Resource
}) {
    const tabs = [{ name: 'About' }, { name: 'Methodology' }]
    const created_at = new Date(datafile?.created ?? '')
    const last_updated = new Date(datafile?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    return (
        <Modal open={open} setOpen={setOpen} className="max-w-[64rem]">
            <div className="flex flex-col gap-y-4 p-5 font-acumin">
                <span
                    className={classNames(
                        'mr-auto flex h-7 w-fit items-center justify-center rounded-sm bg-wri-light-green px-3 text-center text-xs font-normal text-black',
                        getFormatColor(datafile?.format ?? '')
                    )}
                >
                    <span className="my-auto">{datafile.format}</span>
                </span>
                <h2 className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black">
                    {datafile.title ?? datafile.name}
                </h2>
                <p className="font-['Acumin Pro SemiCondensed'] text-base font-light text-stone-900">
                    {datafile.description ?? '-'}
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-x-1">
                        <FingerPrintIcon className="h-4 w-4 text-blue-800" />
                        <div>
                            <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                Created
                            </div>
                            <div className="text-sm font-light text-stone-900">
                                {created_at.toLocaleDateString(
                                    'en-US',
                                    options
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <ArrowPathIcon className="h-4 w-4 text-blue-800" />
                        <div>
                            <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                Last Updated
                            </div>
                            <div className="text-sm font-light text-stone-900">
                                {last_updated.toLocaleDateString(
                                    'en-US',
                                    options
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <ClockIcon className="h-4 w-4 text-blue-800" />
                        <div>
                            <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                Temporal Coverage
                            </div>
                            <div className="text-sm font-light text-stone-900">
                                {dataset?.temporal_coverage_start ||
                                    (dataset?.temporal_coverage_end
                                        ? `${
                                              dataset?.temporal_coverage_start ??
                                              ''
                                          } - ${
                                              dataset?.temporal_coverage_end ??
                                              ''
                                          }`
                                        : ' - ')}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <MapPinIcon className="h-4 w-4 text-blue-800" />
                        <div>
                            <div className="whitespace-nowrap text-sm font-semibold text-neutral-700">
                                Location
                            </div>
                            <div className="text-sm font-light text-stone-900">
                                Sub-Regional
                            </div>
                        </div>
                    </div>
                </div>
                <Tab.Group>
                    <div>
                        <Tab.List as="nav" className="mt-6 flex w-fit border-b">
                            <DatasetTabs tabs={tabs} />
                        </Tab.List>
                        <div className="w-full border-b border-zinc-300" />
                    </div>
                    <Tab.Panels
                        as="div"
                        className="max-h-[18rem] overflow-y-auto"
                    >
                        <Tab.Panel>
                            <div
                                className="prose max-w-none prose-a:text-wri-green font-['Acumin Pro SemiCondensed'] text-justify text-sm font-normal text-black"
                                dangerouslySetInnerHTML={{
                                    __html: dataset?.notes ?? '',
                                }}
                            ></div>
                            <div className="flex flex-col gap-y-2 py-2">
                                {dataset.learn_more && (
                                    <a
                                        href={dataset.learn_more}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-x-1"
                                    >
                                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-wri-green underline">
                                            Learn more
                                        </span>
                                    </a>
                                )}
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div
                                className="prose max-w-none prose-a:text-wri-green font-['Acumin Pro SemiCondensed'] text-justify text-sm font-normal text-black"
                                dangerouslySetInnerHTML={{
                                    __html: dataset?.methodology ?? '',
                                }}
                            ></div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </Modal>
    )
}
