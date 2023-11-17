import { Button } from '@/components/_shared/Button'
import classNames from '@/utils/classnames'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    ArrowTopRightOnSquareIcon,
    ClockIcon,
    LightBulbIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import { DownloadButton } from './datafiles/Download'
import { LearnMoreButton } from './datafiles/LearnMore'
import { OpenInButton } from './datafiles/OpenIn'
import { Resource } from '@/interfaces/dataset.interface'
import { getFormatColor } from '@/utils/formatColors'
import { Index } from 'flexsearch'
import { useState } from 'react'
import { WriDataset } from '@/schema/ckan.schema'

export function DataFiles({
    dataset,
    index,
}: {
    dataset: WriDataset
    index: Index
}) {
    const datafiles = dataset?.resources
    const [q, setQ] = useState('')
    const filteredDatafiles =
        q !== ''
            ? datafiles?.filter((datafile) =>
                  index.search(q).includes(datafile.id)
              )
            : datafiles
    return (
        <>
            <div className="relative py-4">
                <input
                    className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                    placeholder="Search data"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
            </div>
            <div className="flex justify-between pb-1">
                <span className="font-acumin text-base font-normal text-black">
                    {filteredDatafiles?.length ?? 0} Data Files
                </span>
                <div className="flex gap-x-4">
                    <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline">
                        Show All Layers
                    </div>
                    <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline">
                        Hide All
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-y-4">
                {filteredDatafiles?.map((datafile) => (
                    <DatafileCard key={datafile.id} datafile={datafile} dataset={dataset}/>
                ))}
            </div>
        </>
    )
}

function DatafileCard({ datafile, dataset }: { datafile: Resource, dataset: WriDataset }) {
    const created_at = new Date(datafile?.created ?? '')
    const last_updated = new Date(datafile?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    return (
        <Disclosure>
            {({ open }) => (
                <div
                    className={classNames(
                        'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                        open ? 'bg-slate-100' : ''
                    )}
                >
                    <div
                        className={classNames(
                            'flex flex-row items-center justify-between',
                            open ? 'border-b border-neutral-400 pb-2' : ''
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={classNames(
                                    'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                    getFormatColor(datafile?.format ?? '')
                                )}
                            >
                                <span className="my-auto">
                                    {datafile.format}
                                </span>
                            </span>
                            <Disclosure.Button>
                                <h3 className="font-acumin text-lg font-semibold leading-loose text-stone-900">
                                    {datafile.title ?? datafile.name}
                                </h3>
                            </Disclosure.Button>
                        </div>
                        <div className="flex gap-x-2">
                            {/*{datafile.canShow && (
                                <>
                                    {datafile.showing ? (
                                        <Button variant="light" size="sm">
                                            <span className="mt-1">
                                                Remove Layer
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm">
                                            <span>Show Layer</span>
                                        </Button>
                                    )}
                                </>
                            )} */}
                            <Disclosure.Button>
                                <ChevronDownIcon
                                    className={`${
                                        open
                                            ? 'rotate-180 transform  transition'
                                            : ''
                                    } h-5 w-5 text-stone-900`}
                                />
                            </Disclosure.Button>
                        </div>
                    </div>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="py-3">
                            <p className="font-acumin text-base font-light text-stone-900">
                                {datafile.description ?? '-'}
                            </p>
                            <div className="mt-[0.33rem] flex justify-start gap-x-3">
                                <div className="flex flex-row items-center gap-x-1">
                                    <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {created_at.toLocaleDateString(
                                            'en-US',
                                            options
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <ClockIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {last_updated.toLocaleDateString(
                                            'en-US',
                                            options
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <MapPinIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        Sub-Regional
                                    </p>
                                </div>
                            </div>
                            <div className="grid max-w-[30rem] grid-cols-3 gap-x-3 py-4 ">
                                <DownloadButton datafile={datafile} />
                                {/*<LearnMoreButton datafile={datafile} dataset={dataset} />*/}
                                <OpenInButton />
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    )
}
