import {
    ArrowUpRightIcon,
    ChevronLeftIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { Button } from '../_shared/Button'
import {
    ArrowPathIcon,
    ClockIcon,
    FingerPrintIcon,
    LinkIcon,
    StarIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { OpenIn, WriDataset } from '@/schema/ckan.schema'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import classNames from '@/utils/classnames'
import { getFormatColor } from '@/utils/formatColors'
import { useSession } from 'next-auth/react'
import { DefaultTooltip } from '../_shared/Tooltip'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal'
import { LoaderButton } from '@/components/_shared/Button'
import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import Spinner from '../_shared/Spinner'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { TabularResource } from './visualizations/Visualizations'
import TabularViewIcon from './view-icons/TabularViewIcon'
import MapViewIcon from './view-icons/MapViewIcon'
import ToggleVersion from './ToogleVersion'
import { useToggleLayergroups } from '@/utils/storeHooks'
import { useActiveCharts } from '@/utils/storeHooks'
import { View } from '@/interfaces/dataset.interface'
import ChartViewIcon from './view-icons/ChartViewIcon'
import Highlights from '../Highlights'
import { useQuery } from 'react-query'
import { RwDatasetResp, RwResponse, isRwError } from '@/interfaces/rw.interface'
import { match } from 'ts-pattern'

function OpenInButton({
    open_in,
    highlighted = '',
}: {
    open_in: OpenIn[]
    highlighted?: string
}) {
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
                        <span
                            className={classNames(
                                'pl-2 border-l border-gray-200 gap-x-1 cursor-pointer flex items-center text-center text-stone-900 text-base font-bold font-acumin',
                                highlighted
                            )}
                        >
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
                <Menu.Items
                    className={classNames(
                        'absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                        highlighted
                    )}
                >
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
                                            'block px-4 py-2 text-sm',
                                            highlighted
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

export function ExternalService({ rw_id }: { rw_id: string }) {
    const { data } = useQuery([rw_id], async () => {
        const datasetRes = await fetch(
            `https://api.resourcewatch.org/v1/dataset/${rw_id}`
        )
        const dataset: RwDatasetResp = await datasetRes.json()
        if (isRwError(dataset)) throw new Error(dataset.errors[0].detail)
        return dataset.data.attributes
    })
    if (!data) return <></>
    return (
        <>
            {match(data.provider)
                .with('cartodb', 'featureservice', 'gfw', () => (
                    <a
                        className="text-wri-green
flex items-center gap-x-1 mt-4 w-fit
          "
                        href={data.connectorUrl}
                        target="_blank"
                    >
                        <LinkIcon className="h-4 w-4 text-wri-green" />
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                            Open in{' '}
                            {match(data.provider)
                                .with('cartodb', () => 'Carto')
                                .with('featureservice', () => 'ArcGIS')
                                .with('gfw', () => 'GFW')
                                .otherwise(() => '')}
                        </div>
                    </a>
                ))
                .with('gee', () => (
                    <a
                        className="text-wri-green
flex items-center gap-x-1 mt-4 w-fit
          "
                        href={`https://developers.google.com/earth-engine/datasets/catalog/${data.tableName.replaceAll(
                            '/',
                            '_'
                        )}`}
                        target="_blank"
                    >
                        <LinkIcon className="h-4 w-4 text-wri-green" />
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                            Open in GEE
                        </div>
                    </a>
                ))
                .with('csv', 'tsv', 'json', 'xml', () => {
                    if (data.sources.length === 1) {
                        return (
                            <a
                                className="text-wri-greenflex items-center gap-x-1 mt-4 w-fit"
                                href={data.sources[0]}
                                target="_blank"
                            >
                                <LinkIcon className="h-4 w-4 text-wri-green" />
                                <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                                    Open {data.provider.toUpperCase()}
                                </div>
                            </a>
                        )
                    }
                    return (
                        <Menu
                            as="div"
                            className="relative inline-block text-left py-4"
                        >
                            <div>
                                <Menu.Button><Button size="sm">Open external sources</Button></Menu.Button>
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
                                        {data.sources.map((item, index) => (
                                            <Menu.Item key={item}>
                                                {({ active }) => (
                                                    <a
                                                        href={item}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={classNames(
                                                            active
                                                                ? 'bg-gray-100 text-gray-900'
                                                                : 'text-gray-700',
                                                            'block px-4 py-2 text-sm'
                                                        )}
                                                    >
                                                        Source {index + 1}
                                                    </a>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    )
                })
                .otherwise(() => (
                    <></>
                ))}
        </>
    )
}

export function DatasetHeader({
    dataset,
    setTabularResource,
    tabularResource,
    diffFields,
    isCurrentVersion,
    setIsCurrentVersion,
    datasetAuth,
    is_approved,
}: {
    dataset?: WriDataset
    isCurrentVersion?: boolean
    diffFields: string[]
    setIsCurrentVersion: React.Dispatch<React.SetStateAction<boolean>>
    setTabularResource: (tabularResource: TabularResource | null) => void
    tabularResource: TabularResource | null
    datasetAuth?: boolean
    is_approved?: boolean
}) {
    const { tempLayerAsLayerobj, prevLayerGroups, setToggleLayergroups } =
        useToggleLayergroups()
    const { activeCharts, addCharts, removeCharts } = useActiveCharts()
    const [open, setOpen] = useState(false)
    const [fopen, setFOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const session = useSession()
    const { data, isLoading, refetch } = api.dataset.isFavoriteDataset.useQuery(
        dataset?.id as string,
        { retry: false, enabled: !!session.data?.user }
    )

    const {
        data: datasetViews,
        isLoading: isDatasetViewsLoading,
        error: datasetViewsError,
    } = api.rw.getDatasetViews.useQuery(
        { rwDatasetId: dataset?.rw_id ?? '' },
        { enabled: !!dataset?.rw_id }
    )

    const addToFavorites = api.dataset.followDataset.useMutation({
        onSuccess: async (data) => {
            await refetch()
            setOpen(false)
            notify(
                `Successfully added the ${
                    dataset?.title ?? dataset?.name
                } dataset to your favorites`,
                'success'
            )
        },
        onError: (error) => setErrorMessage(error.message),
    })
    const removeFromFavorites = api.dataset.unFollowDataset.useMutation({
        onSuccess: async (data) => {
            await refetch()
            setFOpen(false)
            notify(
                `Successfully removed the ${
                    dataset?.title ?? dataset?.name
                } dataset from your favorites`,
                'error'
            )
        },
        onError: (error) => setErrorMessage(error.message),
    })
    const created_at = new Date(dataset?.metadata_created ?? '')
    const last_updated = new Date(dataset?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const

    const highlighted = (field: string) => {
        if (diffFields && !isCurrentVersion) {
            if (diffFields.includes(field)) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }

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
                    <OpenInButton
                        open_in={dataset?.open_in ?? []}
                        highlighted={highlighted('open_in')}
                    />
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
                        <OpenInButton
                            open_in={dataset?.open_in ?? []}
                            highlighted={highlighted('open_in')}
                        />
                    </div>
                    <div className="flex items-center gap-x-2">
                        {datasetAuth && diffFields.length > 0 && (
                            <ToggleVersion
                                enabled={isCurrentVersion!}
                                is_approved={is_approved!}
                                approval_status={dataset?.approval_status!}
                                setEnabled={(enabled) => {
                                    setToggleLayergroups(
                                        prevLayerGroups,
                                        tempLayerAsLayerobj
                                    )
                                    setIsCurrentVersion(enabled)
                                }}
                            />
                        )}
                        {isLoading ? (
                            <Spinner className="w-2 h-2" />
                        ) : data !== undefined && data ? (
                            <DefaultTooltip
                                content="remove from favorites"
                                side="bottom"
                            >
                                <button
                                    className="p-0 m-0 "
                                    onClick={() => setFOpen(true)}
                                >
                                    <StarIcon className="cursor-pointer h-6 w-6 text-wri-gold" />
                                </button>
                            </DefaultTooltip>
                        ) : (
                            <DefaultTooltip
                                content="Add to favorites"
                                side="bottom"
                            >
                                <button
                                    className="p-0 m-0 "
                                    onClick={() => setOpen(true)}
                                >
                                    <StarIcon className="cursor-pointer h-6 w-6 " />
                                </button>
                            </DefaultTooltip>
                        )}

                        <DefaultTooltip content="Edit" side="bottom">
                            <Link
                                href={`/dashboard/datasets/${dataset?.name}/edit`}
                            >
                                <PencilSquareIcon className="cursor-pointer h-6 w-6 text-yellow-800" />
                            </Link>
                        </DefaultTooltip>
                    </div>
                    {open && (
                        <Modal
                            open={open}
                            setOpen={setOpen}
                            className="sm:w-full sm:max-w-lg"
                            key="add-to-favorites"
                        >
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <InformationCircleIcon
                                        className="h-6 w-6 text-green-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-base font-semibold leading-6 text-gray-900"
                                    >
                                        Add to favorites
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to add{' '}
                                            {dataset?.title ?? dataset?.name} to
                                            your favorites?
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                                <LoaderButton
                                    variant="light"
                                    className="bg-wri-gold "
                                    onClick={() => {
                                        addToFavorites.mutate(
                                            dataset?.id as string
                                        )
                                    }}
                                    loading={addToFavorites.isLoading}
                                >
                                    Add
                                </LoaderButton>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Modal>
                    )}
                    {fopen && (
                        <Modal
                            open={fopen}
                            setOpen={setFOpen}
                            className="sm:w-full sm:max-w-lg"
                            key="add-to-favorites"
                        >
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon
                                        className="h-6 w-6 text-red-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-base font-semibold leading-6 text-gray-900"
                                    >
                                        Remove from favorites
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to remove{' '}
                                            {dataset?.title ?? dataset?.name}{' '}
                                            from your favorites?
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                                <LoaderButton
                                    variant="destructive"
                                    onClick={() => {
                                        removeFromFavorites.mutate(
                                            dataset?.id as string
                                        )
                                    }}
                                    loading={removeFromFavorites.isLoading}
                                >
                                    Remove
                                </LoaderButton>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setFOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Modal>
                    )}
                    {errorMessage && (
                        <div className="py-4">
                            <ErrorAlert text={errorMessage} />
                        </div>
                    )}
                </div>
            )}
            <div className="px-4 sm:px-6">
                <div className="mb-4 flex justify-start gap-x-3">
                    {dataset && (
                        <div
                            className="flex justify-start gap-x-3
            "
                        >
                            <ChartViewIcon dataset={dataset} />
                            <MapViewIcon dataset={dataset} />
                            <TabularViewIcon dataset={dataset} />
                        </div>
                    )}
                </div>
                <div className="flex max-w-[560px] flex-col gap-y-2">
                    <h2 className="text-xs font-bold uppercase leading-none tracking-wide text-green-700">
                        <span
                            className={classNames(
                                'w-fit',
                                highlighted('organization')
                            )}
                        >
                            {dataset?.organization?.title ?? 'No Team'}
                        </span>
                    </h2>
                    <div className="flex items-center gap-x-3">
                        <h1
                            className={`w-fit text-3xl font-bold text-black ${
                                dataset?.title
                                    ? highlighted('title')
                                    : highlighted('name')
                            }  `}
                        >
                            {dataset?.title ?? dataset?.name}{' '}
                        </h1>
                        {session?.data?.user && (
                            <span
                                className={`rounded-full h-fit text-sm lg:text-xs px-2 py-y border border-gray-400 capitalize ${highlighted(
                                    'visibility_type'
                                )}`}
                            >
                                {dataset?.visibility_type}
                            </span>
                        )}
                    </div>
                    <p
                        className={`text-justify text-base font-light leading-snug text-stone-900 w-fit ${highlighted(
                            'short_description'
                        )}`}
                    >
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
                                <div
                                    className={`whitespace-nowrap text-sm font-semibold text-neutral-700 ${highlighted(
                                        'metadata_modified'
                                    )}`}
                                >
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
                                        <span
                                            className={classNames(
                                                highlighted(
                                                    'temporal_coverage_start'
                                                )
                                            )}
                                        >
                                            {dataset?.temporal_coverage_start ??
                                                ''}
                                        </span>{' '}
                                        -
                                        <span
                                            className={classNames(
                                                highlighted(
                                                    'temporal_coverage_end'
                                                )
                                            )}
                                        >
                                            {dataset?.temporal_coverage_end ??
                                                ''}
                                        </span>{' '}
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
                            <span
                                className={`font-acumin text-sm font-semibold leading-none text-black ${highlighted(
                                    'cautions'
                                )}`}
                            >
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
                    ) : (
                        ''
                    )}
                    {session.data?.user ? (
                        dataset?.technical_notes ? (
                            <div
                                className={classNames(
                                    'flex items-center rounded-[3px] border border-green-500 bg-green-500',
                                    highlighted('technical_notes'),
                                    highlighted('technical_notes') !== ''
                                        ? 'border-yellow-200'
                                        : ''
                                )}
                            >
                                <div className="px-2 font-acumin text-xs font-medium text-white">
                                    RDI approved
                                </div>
                            </div>
                        ) : (
                            <div
                                className={classNames(
                                    'flex items-center rounded-[3px] border border-orange-400 bg-orange-400',
                                    highlighted('technical_notes'),
                                    highlighted('technical_notes') !== ''
                                        ? 'border-yellow-200'
                                        : ''
                                )}
                            >
                                <div className="px-2 font-acumin text-xs font-medium text-white">
                                    Awaiting RDI approval
                                </div>
                            </div>
                        )
                    ) : (
                        <></>
                    )}
                    {dataset?.resources &&
                        dataset?.resources.filter((resource) => resource.format)
                            .length > 0 && (
                            <div
                                className={classNames(
                                    'flex gap-x-2 border-zinc-300',
                                    session.data?.user ? 'border-l pl-3' : ''
                                )}
                            >
                                {[
                                    ...new Set(
                                        dataset?.resources
                                            .filter(
                                                (resource) => resource.format
                                            )
                                            .map((resource) => resource.format)
                                    ),
                                ].map((format, i) => (
                                    <span
                                        key={'format-pill-' + format}
                                        className={classNames(
                                            'flex h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black',
                                            getFormatColor(format ?? '')
                                        )}
                                    >
                                        <span className="my-auto">
                                            {format?.toUpperCase()}
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
                        className={classNames(
                            'flex items-center gap-x-1 mt-4 w-fit',
                            highlighted('technical_notes')
                        )}
                    >
                        <LinkIcon className="h-4 w-4 text-wri-green" />
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                            Technical Notes
                        </div>
                    </a>
                )}

                <div className="flex space-x-2">
                    {dataset?.provider && dataset?.provider !== 'gee' && dataset?.rw_id && (
                        <div className="pt-4">
                            {tabularResource &&
                            tabularResource.id === dataset.rw_id ? (
                                <Button
                                    size="sm"
                                    onClick={() => setTabularResource(null)}
                                >
                                    Remove Tabular View
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setTabularResource({
                                            provider:
                                                dataset.provider as string,
                                            id: dataset.rw_id as string,
                                        })
                                    }
                                >
                                    View Table Preview
                                </Button>
                            )}
                        </div>
                    )}
                    {dataset?.provider &&
                        dataset?.rw_id &&
                        !isDatasetViewsLoading &&
                        datasetViews?.some(
                            (v: View) => v.config_obj?.type == 'chart'
                        ) && (
                            <div className="py-4">
                                {activeCharts
                                    .map((c: View) => c.id)
                                    .some((id: string) =>
                                        datasetViews
                                            .map((v: View) => v.id)
                                            .includes(id)
                                    ) ? (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            removeCharts(
                                                datasetViews?.map(
                                                    (v: View) => v.id ?? ''
                                                )
                                            )
                                        }}
                                    >
                                        Remove Chart Preview
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            addCharts(datasetViews)
                                        }}
                                    >
                                        View Chart Preview
                                    </Button>
                                )}
                            </div>
                        )}
                </div>
                {dataset?.rw_id && (
                    <div>
                        <ExternalService rw_id={dataset.rw_id} />
                    </div>
                )}
            </div>
        </div>
    )
}
