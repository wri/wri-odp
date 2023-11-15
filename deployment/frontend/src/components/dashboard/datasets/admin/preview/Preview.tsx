import classNames from '@/utils/classnames'
import { Disclosure, Transition } from '@headlessui/react'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import {
    ChevronDownIcon,
    GlobeAsiaAustraliaIcon,
    LinkIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { useLayoutEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { UseFormReturn } from 'react-hook-form'
import {
    DataDictionaryFormType,
    DatasetFormType,
} from '@/schema/dataset.schema'
import { formatDate } from '@/utils/formatDate'
import { convertBytes } from '@/utils/convertBytes'

export function Preview({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { watch } = formObj
    return (
        <div className="mx-auto w-full max-w-[71rem] bg-white px-4 font-acumin shadow sm:px-6 xxl:px-0">
            <div className="p-4 sm:p-8 xxl:p-24">
                <h1 className="font-['Acumin Pro SemiCondensed'] text-3xl font-bold leading-tight text-zinc-800">
                    {watch('title')}
                </h1>
                <h2 className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-stone-500">
                    /dataset/{watch('name')}
                </h2>

                <div className="py-8">
                    <div className="border-b border-stone-50 py-8">
                        <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
                            Overview
                        </h3>
                        <div className="grid sm:grid-cols-2">
                            <dl className="flex flex-col gap-y-6">
                                <SimpleDescription
                                    label="Source"
                                    text={watch('source') ?? '_'}
                                />
                                <SimpleDescription
                                    label="Language"
                                    text={watch('language')?.label ?? '_'}
                                />
                                <SimpleDescription
                                    label="Team"
                                    text={watch('team')?.label ?? '_'}
                                />
                                <SimpleDescription
                                    label="Project"
                                    text={watch('project') ?? '_'}
                                />
                                <ListOfItems
                                    label="Topics"
                                    items={watch('topics') ?? []}
                                />
                                <SimpleDescription
                                    label="Technical Notes"
                                    text={watch('technical_notes') ?? '_'}
                                />
                                <SimpleDescription
                                    label="Featured Dataset"
                                    text={
                                        watch('featured_dataset') ? 'Yes' : 'No'
                                    }
                                />
                            </dl>
                            <dl className="flex flex-col gap-y-6">
                                <ListOfItems
                                    label="Tags"
                                    items={watch('tags') ?? []}
                                />
                                <SimpleDescription
                                    label="Temporal Coverage"
                                    text={
                                        watch('temporalCoverageStart') ||
                                        watch('temporalCoverageEnd')
                                            ? `${watch(
                                                  'temporalCoverageStart'
                                              )} - ${watch(
                                                  'temporalCoverageEnd'
                                              )}`
                                            : '_'
                                    }
                                />
                                <SimpleDescription
                                    label="Update Frequency"
                                    text={
                                        watch('update_frequency')?.label ?? '_'
                                    }
                                />
                                <SimpleDescription
                                    label="Citation"
                                    text={watch('citation') ?? '_'}
                                />
                                <SimpleDescription
                                    label="Visibility"
                                    text={
                                        watch('visibility_type')?.label ?? '_'
                                    }
                                />
                                <SimpleDescription
                                    label="License"
                                    text={watch('license')?.label ?? '_'}
                                />
                            </dl>
                        </div>
                    </div>
                    {(watch('notes') || watch('short_description')) && (
                        <div className="border-b border-stone-50 py-8">
                            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
                                Description
                            </h3>
                            <dl className="flex flex-col gap-y-6">
                                <SimpleDescription
                                    label="Short Description"
                                    text={watch('short_description') ?? '_'}
                                />
                                <FullDescription label="Full Description">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: watch('notes') ?? '_',
                                        }}
                                    ></div>
                                </FullDescription>
                            </dl>
                        </div>
                    )}
                    {(watch('author') ||
                        watch('author_email') ||
                        watch('maintainer') ||
                        watch('maintainer_email')) && (
                        <div className="border-b border-stone-50 py-8 pb-6">
                            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
                                Points of Contact
                            </h3>
                            <div className="grid sm:grid-cols-2">
                                <dl className="flex flex-col gap-y-6">
                                    <SimpleDescription
                                        label="Author Name"
                                        text={watch('author') ?? '_'}
                                    />
                                    <SimpleDescription
                                        label="Author Email"
                                        text={watch('author_email') ?? '_'}
                                    />
                                </dl>
                                <dl className="flex flex-col gap-y-6">
                                    <SimpleDescription
                                        label="Maintainer Name"
                                        text={watch('maintainer') ?? '_'}
                                    />
                                    <SimpleDescription
                                        label="Maintainer Email"
                                        text={watch('maintainer_email') ?? '_'}
                                    />
                                </dl>
                            </div>
                        </div>
                    )}
                    {(watch('function') ||
                        watch('restrictions') ||
                        watch('learn_more') ||
                        watch('reason_for_adding') ||
                        watch('methodology') ||
                        watch('cautions')) && (
                        <div className="border-b border-stone-50 py-8 pb-6">
                            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
                                More details
                            </h3>
                            <div className="grid">
                                <dl className="flex flex-col gap-y-6">
                                    <SimpleDescription
                                        label="Learn More"
                                        text={watch('learn_more') ?? '_'}
                                    />
                                    <FullDescription label="Function">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    watch('function') ?? '_',
                                            }}
                                        ></div>
                                    </FullDescription>
                                    <FullDescription label="Rstrictions">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    watch('restrictions') ??
                                                    '_',
                                            }}
                                        ></div>
                                    </FullDescription>
                                    <FullDescription label="Reasons for adding">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    watch(
                                                        'reason_for_adding'
                                                    ) ?? '_',
                                            }}
                                        ></div>
                                    </FullDescription>
                                    <FullDescription label="Cautions">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    watch('cautions') ?? '_',
                                            }}
                                        ></div>
                                    </FullDescription>
                                    <FullDescription label="Methodology">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: watch('methodology') ?? '_',
                                            }}
                                        ></div>
                                    </FullDescription>
                                </dl>
                            </div>
                        </div>
                    )}
                    {watch('resources') && watch('resources').length > 0 && (
                        <div className="border-b border-stone-50 py-8 pb-6">
                            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
                                Data files
                            </h3>
                            <div>
                                {watch('resources').map((resource) => (
                                    <Datafile
                                        key={resource.resourceId}
                                        name={
                                            resource.name ?? resource.url ?? '-'
                                        }
                                        title={resource.title ?? '-'}
                                        type={resource.type ?? 'empty'}
                                        format={resource.format?.label ?? '-'}
                                        size={resource.size ?? null}
                                        description={
                                            resource.description ?? '-'
                                        }
                                        dataDictionary={
                                            resource.dataDictionary ?? []
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function FullDescription({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    const [showReadMore, setShowReadMore] = useState(false)
    const [readMore, setReadMore] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    useLayoutEffect(() => {
        if (
            ref.current &&
            ref.current.clientHeight < ref.current.scrollHeight
        ) {
            setShowReadMore(true)
            return
        }
        setShowReadMore(false)
    }, [])

    return (
        <div>
            <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
                {label}
            </dt>
            <div
                ref={ref}
                className={classNames(
                    'max-h-[180px] overflow-y-hidden font-acumin text-lg font-normal leading-tight text-stone-500 transition',
                    readMore ? 'max-h-fit' : ''
                )}
            >
                {children}
            </div>
            {showReadMore && (
                <button
                    onClick={() => setReadMore(!readMore)}
                    className="font-['Acumin Pro SemiCondensed'] flex items-center gap-x-2 py-4 text-lg font-semibold leading-tight text-wri-green"
                >
                    Read {readMore ? 'less' : 'more'}
                    <ChevronDownIcon
                        className={`${
                            readMore ? 'rotate-180 transform  transition' : ''
                        } h-5 w-5 text-wri-green`}
                    />
                </button>
            )}
        </div>
    )
}

function SimpleDescription({ label, text }: { label: string; text: string }) {
    return (
        <div>
            <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
                {label}
            </dt>
            <dd className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-stone-500">
                {text !== '' ? text : '_'}
            </dd>
        </div>
    )
}

function ListOfItems({ label, items }: { label: string; items: string[] }) {
    return (
        <div>
            <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
                {label}
            </dt>
            <div className="flex flex-wrap gap-3">
                {items.map((item, index) => (
                    <span
                        key={index}
                        className="flex items-center gap-x-2 rounded-[3px] border border-blue-800 bg-white px-2 py-0.5"
                    >
                        <span className="font-['Acumin Pro SemiCondensed'] mt-1 text-[15px] font-normal text-zinc-800">
                            {item}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    )
}

interface DatafilePreviewProps {
    type: 'link' | 'upload' | 'layer' | 'empty'
    name: string
    title: string
    format: string
    description: string
    size: number | null
    dataDictionary: DataDictionaryFormType
}

function Datafile({
    type,
    name,
    title,
    format,
    description,
    size,
    dataDictionary,
}: DatafilePreviewProps) {
    return (
        <Disclosure>
            {({ open }) => (
                <>
                    <Disclosure.Button
                        className={classNames(
                            'flex w-full items-center justify-between rounded-sm bg-white px-6 pt-3 shadow transition hover:bg-slate-100',
                            open ? 'bg-slate-100' : 'bg-white'
                        )}
                    >
                        <div
                            className={classNames(
                                'flex w-full items-center justify-between gap-x-2 pb-3',
                                open ? 'border-b border-zinc-300' : ''
                            )}
                        >
                            <div className="flex items-center gap-x-2">
                                {match(type)
                                    .with('upload', () => (
                                        <>
                                            <PaperClipIcon className="h-6 w-6 text-blue-800" />
                                            <span className="text-lg font-light text-black">
                                                {name}
                                            </span>
                                            <span className="text-right font-acumin text-xs font-normal leading-tight text-neutral-500">
                                                {size
                                                    ? convertBytes(size)
                                                    : '-'}
                                            </span>
                                        </>
                                    ))
                                    .with('link', () => (
                                        <>
                                            <LinkIcon className="h-6 w-6 text-blue-800" />
                                            <span className="text-lg font-light text-black">
                                                {name}
                                            </span>
                                        </>
                                    ))
                                    .with('empty', () => <></>)
                                    .otherwise(() => (
                                        <>
                                            <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                                            <span className="text-lg font-light text-black">
                                                {name}
                                            </span>
                                        </>
                                    ))}
                            </div>
                            <ChevronDownIcon
                                className={classNames(
                                    'h-4 w-4 text-zinc-300',
                                    open ? 'rotate-180 transform' : ''
                                )}
                            />
                        </div>
                    </Disclosure.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel>
                            <div className="grid sm:grid-cols-2 gap-4 bg-slate-100 p-6">
                                <SimpleDescription label="Title" text={title} />
                                <SimpleDescription
                                    label="Format"
                                    text={format}
                                />
                                <div className="col-span-full">
                                    <SimpleDescription
                                        label="Description"
                                        text={description}
                                    />
                                </div>
                                {type === 'upload' &&
                                    dataDictionary.length > 0 && (
                                        <div className="col-span-full">
                                            <PreviewTable
                                                dataDictionary={dataDictionary}
                                            />
                                        </div>
                                    )}
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}

function PreviewTable({
    dataDictionary,
}: {
    dataDictionary: DataDictionaryFormType
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-neutral-50">
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Field
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Type
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Null
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Key
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Default
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dataDictionary.map((field, index) => (
                    <TableRow
                        key={index}
                        className={
                            index % 2 != 0
                                ? 'border-0 bg-[#FDFDFD]'
                                : 'border-0 bg-white'
                        }
                    >
                        <TableCell>{field.field}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.null ? 'YES' : 'NO'}</TableCell>
                        <TableCell>{field.key}</TableCell>
                        <TableCell>{field.default}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
