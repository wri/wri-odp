import { Button } from '@/components/_shared/Button';
import classNames from '@/utils/classnames';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
    ArrowPathIcon,
    FingerPrintIcon,
    MapPinIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { DownloadButton } from '../Download';
import { type Resource, type View } from '@/interfaces/dataset.interface';
import { getFormatColor } from '@/utils/formatColors';
import { type WriDataset } from '@/schema/ckan.schema';
import { useLayersFromRW } from '@/utils/queryHooks';
import { useActiveCharts, useActiveLayerGroups } from '@/utils/storeHooks';
import { type TabularResource } from '../../../visualizations/Visualizations';
import { APIButton } from '../API';
import DefaultTooltip from '@/components/_shared/Tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/_shared/Popover';
import { env } from '@/env.mjs';

function customDataLayer(data: { event: string; resource_name: string }) {
    if (env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
        //@ts-ignore
        dataLayer.push({
            event: data.event,
            resource_name: data.resource_name,
        });
    }
}

export function DatafileCard({
    datafile,
    dataset,
    setTabularResource,
    tabularResource,
    diffFields,
    isCurrentVersion,
    selected,
    addDatafileToDownload,
    removeDatafileToDownload,
    index,
    mapDisplaypreview,
    setMapDisplayPreview,
}: {
    datafile: Resource;
    dataset: WriDataset;
    setTabularResource: (tabularResource: TabularResource | null) => void;
    tabularResource: TabularResource | null;
    isCurrentVersion?: boolean;
    diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
    index: number;
    selected: boolean;
    addDatafileToDownload: (datafile: Resource) => void;
    removeDatafileToDownload: (datafile: Resource) => void;
    setMapDisplayPreview: (mapDisplaypreview: boolean) => void;
    mapDisplaypreview: boolean;
}) {
    const { activeCharts, addCharts, removeCharts } = useActiveCharts();
    const { data: activeLayers } = useLayersFromRW();
    const { removeLayerFromLayerGroup, addLayerToLayerGroup } = useActiveLayerGroups();

    const created_at = new Date(datafile?.created ?? '');
    const last_updated = new Date(datafile?.metadata_modified ?? '');
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const;

    const higlighted = (field: string, value: string) => {
        if (diffFields && !isCurrentVersion) {
            if (
                diffFields.some(
                    (diffField) => diffField[field] && diffField[field]?.new_value === value
                )
            ) {
                return 'bg-yellow-200';
            }
        }
        return '';
    };
    const newDatafile = () => {
        if (diffFields && !isCurrentVersion) {
            if (diffFields[index] && diffFields[index]?.undefined?.old_value === null) {
                return 'bg-yellow-200';
            }
        }
        return '';
    };

    return (
        <Disclosure>
            {({ open }) => (
                <div
                    className={classNames(
                        'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                        open ? 'bg-slate-100' : '',
                        newDatafile()
                    )}
                >
                    <div
                        className={classNames(
                            'flex flex-row items-center justify-between',
                            open ? 'border-b border-neutral-400 pb-2' : ''
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {['upload', 'link'].includes(datafile.url_type ?? '') &&
                                datafile.not_downloadable !== true && (
                                    <DefaultTooltip content="Select to download">
                                        <input
                                            aria-label={`Select ${datafile.title}`}
                                            type="checkbox"
                                            className="h-4 w-4  rounded  bg-white "
                                            checked={selected}
                                            onChange={() => {
                                                if (selected) {
                                                    removeDatafileToDownload(datafile);
                                                } else {
                                                    addDatafileToDownload(datafile);
                                                }
                                            }}
                                        />
                                    </DefaultTooltip>
                                )}
                            {['upload', 'link'].includes(datafile.url_type ?? '') &&
                                datafile.not_downloadable && (
                                    <DefaultTooltip content="Not selectable for direct download">
                                        <input
                                            aria-label={`Select ${datafile.title}`}
                                            type="checkbox"
                                            className="h-4 w-4  rounded  bg-gray-200 border-gray-300"
                                            disabled
                                            checked={false}
                                        />
                                    </DefaultTooltip>
                                )}
                            {datafile?.format && (
                                <span
                                    className={classNames(
                                        'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                        getFormatColor(datafile?.format ?? '')
                                    )}
                                >
                                    <span className="my-auto">{datafile.format}</span>
                                </span>
                            )}
                            <Disclosure.Button>
                                <h3
                                    className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${
                                        datafile.title
                                            ? higlighted('title', datafile.title)
                                            : higlighted('name', datafile.name!)
                                    }`}
                                >
                                    {datafile.title ?? datafile.name}
                                </h3>
                                {datafile.spatial_address && (
                                    <div className="flex items-center gap-x-1">
                                        <MapPinIcon className="h-3 w-3 text-blue-800" />
                                        <p
                                            className={`font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm ${higlighted(
                                                'spatial_address',
                                                datafile.spatial_address
                                            )}`}
                                        >
                                            {datafile.spatial_address}
                                        </p>
                                    </div>
                                )}
                            </Disclosure.Button>
                        </div>
                        <div className="gap-x-2 hidden sm:flex">
                            {/* @ts-ignore */}
                            {['layer', 'layer-raw', 'reference-layer'].includes(datafile.type) && (
                                <>
                                    {activeLayers.some((a) => {
                                        return (
                                            datafile.url?.endsWith(a?.id) || datafile.id === a?.id
                                        );
                                    }) ? (
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => {
                                                // @ts-ignore
                                                if (datafile.rw_id) {
                                                    removeLayerFromLayerGroup(
                                                        // @ts-ignore
                                                        datafile?.rw_id,
                                                        dataset.id
                                                    );
                                                }
                                                removeLayerFromLayerGroup(
                                                    // @ts-ignore
                                                    datafile?.id,
                                                    dataset.id
                                                );
                                            }}
                                        >
                                            <span className="mt-1 text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Layer
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            id={`layerviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
                                            onClick={() => {
                                                // @ts-ignore
                                                if (!mapDisplaypreview) {
                                                    setMapDisplayPreview(true);
                                                }
                                                if (
                                                    datafile.layerObj?.layerConfig ||
                                                    datafile.layerObjRaw?.layerConfig
                                                ) {
                                                    addLayerToLayerGroup(
                                                        // @ts-ignore
                                                        datafile.id,
                                                        dataset.id,
                                                        'ckan'
                                                    );
                                                } else {
                                                    addLayerToLayerGroup(
                                                        // @ts-ignore
                                                        datafile.rw_id != '' &&
                                                            datafile.rw_id != null
                                                            ? datafile.rw_id
                                                            : datafile.id,
                                                        dataset.id,
                                                        'rw'
                                                    );
                                                }
                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name: datafile.title ?? datafile.name!,
                                                });
                                            }}
                                        >
                                            Show Layer
                                        </Button>
                                    )}
                                </>
                            )}
                            {datafile.datastore_active && (
                                <>
                                    {tabularResource?.id === datafile.id ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTabularResource(null)}
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Tabular View
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            id={`tableviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
                                            onClick={() => {
                                                setTabularResource({
                                                    provider: 'datastore',
                                                    datasetName: dataset.title ?? dataset.name,
                                                    id: datafile.id,
                                                    name: datafile?.title ?? datafile.name!,
                                                });

                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name: datafile.title ?? datafile.name!,
                                                });
                                            }}
                                        >
                                            View Table Preview
                                        </Button>
                                    )}
                                </>
                            )}

                            {datafile._hasChartView && (
                                <>
                                    {datafile?._views?.some((v) =>
                                        activeCharts.map((c: View) => c.id).includes(v.id)
                                    ) ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const viewIds = datafile._views?.map(
                                                    (v: View) => v.id
                                                );
                                                if (viewIds) {
                                                    removeCharts(viewIds as string[]);
                                                }
                                            }}
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Chart Preview
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            id={`chartviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
                                            data-resource={datafile.title ?? datafile.name!}
                                            onClick={() => {
                                                if (datafile._views) addCharts(datafile._views);

                                                //@ts-ignore
                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name: datafile.title ?? datafile.name!,
                                                });
                                            }}
                                        >
                                            View Chart Preview
                                        </Button>
                                    )}
                                </>
                            )}

                            <Disclosure.Button role="button" aria-label="expand">
                                <ChevronDownIcon
                                    className={`${
                                        open ? 'rotate-180 transform  transition' : ''
                                    } h-5 w-5 text-stone-900`}
                                />
                            </Disclosure.Button>
                        </div>
                        <Popover>
                            <PopoverTrigger className="sm:hidden">
                                <PlusCircleIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                            </PopoverTrigger>
                            <PopoverContent className="w-fit flex flex-col">
                                {datafile?.rw_id && (
                                    <>
                                        {activeLayers.some(
                                            (a) =>
                                                datafile.url?.endsWith(a.id) || datafile.id === a.id
                                        ) ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    {
                                                    }
                                                    // @ts-ignore
                                                    if (datafile.rw_id) {
                                                        removeLayerFromLayerGroup(
                                                            // @ts-ignore
                                                            datafile?.rw_id,
                                                            dataset.id
                                                        );
                                                    }
                                                }}
                                            >
                                                <span className="mt-1 text-xs 2xl:text-sm whitespace-nowrap">
                                                    Remove Layer
                                                </span>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                id={`layerviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    // @ts-ignore
                                                    if (datafile.rw_id) {
                                                        if (!mapDisplaypreview) {
                                                            setMapDisplayPreview(true);
                                                        }
                                                        addLayerToLayerGroup(
                                                            // @ts-ignore
                                                            datafile.rw_id,
                                                            dataset.id
                                                        );
                                                    }

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ?? datafile.name!,
                                                    });
                                                }}
                                            >
                                                Show Layer
                                            </Button>
                                        )}
                                    </>
                                )}
                                {datafile.datastore_active && (
                                    <>
                                        {tabularResource?.id === datafile.id ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTabularResource(null)}
                                            >
                                                <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                    Remove Tabular View
                                                </span>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                id={`tableviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    setTabularResource({
                                                        provider: 'datastore',
                                                        datasetName: dataset.title ?? dataset.name,
                                                        id: datafile.id,
                                                        name: datafile?.title ?? datafile.name!,
                                                    });

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ?? datafile.name!,
                                                    });
                                                }}
                                            >
                                                View Table Preview
                                            </Button>
                                        )}
                                    </>
                                )}

                                {datafile._hasChartView && (
                                    <>
                                        {datafile?._views?.some((v) =>
                                            activeCharts.map((c: View) => c.id).includes(v.id)
                                        ) ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const viewIds = datafile._views?.map(
                                                        (v: View) => v.id
                                                    );
                                                    if (viewIds) {
                                                        removeCharts(viewIds as string[]);
                                                    }
                                                }}
                                            >
                                                <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                    Remove Chart Preview
                                                </span>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                id={`chartviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    if (datafile._views) addCharts(datafile._views);

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ?? datafile.name!,
                                                    });
                                                }}
                                            >
                                                View Chart Preview
                                            </Button>
                                        )}
                                    </>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Transition
                        as="div"
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="py-3">
                            <p
                                className={`font-acumin text-base font-light text-stone-900 ${
                                    datafile.description
                                        ? higlighted('description', datafile.description)
                                        : ''
                                }`}
                            >
                                {datafile.description ?? 'No Description'}
                            </p>
                            <div className="mt-[0.33rem] flex justify-start gap-x-3">
                                <div className="flex flex-row items-center gap-x-1">
                                    <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {created_at.toLocaleDateString('en-US', options)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {last_updated.toLocaleDateString('en-US', options)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid max-w-[30rem] grid-cols-3 gap-x-3 py-4 ">
                                {datafile.url_type === 'link' || datafile.url_type === 'upload' ? (
                                    <>
                                        <DownloadButton datafile={datafile} dataset={dataset} />
                                    </>
                                ) : (
                                    <></>
                                )}
                                {/*<LearnMoreButton datafile={datafile} dataset={dataset} />*/}
                                <APIButton datafile={datafile} />
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    );
}
