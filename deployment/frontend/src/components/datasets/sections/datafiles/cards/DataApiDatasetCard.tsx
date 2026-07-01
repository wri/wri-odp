import { Button, LoaderButton } from '@/components/_shared/Button';
import classNames from '@/utils/classnames';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    FingerPrintIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { type Resource } from '@/interfaces/dataset.interface';
import { useCallback, useMemo, useState } from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/_shared/Popover';
import { DirectDownloadPopup, type DownloadEventForm } from '@/components/_shared/DownloadPopup';
import DefaultTooltip from '@/components/_shared/Tooltip';
import dynamic from 'next/dynamic';

const TileMapPreview = dynamic(
    () => import('@/components/_shared/TileMapPreview').then((m) => m.TileMapPreview),
    { ssr: false }
);

function tileToDownloadUrl(tilePath: string, datasetId: string, version: string): string | null {
    const parts = tilePath.split('/');
    if (parts.length < 12) return null;

    const filename = parts[parts.length - 1];
    const format = parts[parts.length - 2];
    const pixelMeaning = parts[parts.length - 3];
    const grid2 = parts[parts.length - 4];
    const grid1 = parts[parts.length - 5];

    const tileId = filename?.replace(/\.[^.]+$/, '');
    if (!tileId || !format || !pixelMeaning || !grid1 || !grid2) return null;

    const params = new URLSearchParams({
        dataset: datasetId,
        version,
        format,
        grid: `${grid1}/${grid2}`,
        tile_id: tileId,
        pixel_meaning: pixelMeaning,
    });

    return `/api/data-api-download?${params.toString()}`;
}

export function DataApiDatasetCard({
    datafile,
    dataset,
    diffFields,
    isCurrentVersion,
    index,
    selected,
    addDatafileToDownload,
    removeDatafileToDownload,
}: {
    datafile: Resource;
    dataset: WriDataset;
    isCurrentVersion?: boolean;
    diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
    index: number;
    selected: boolean;
    addDatafileToDownload: (datafile: Resource) => void;
    removeDatafileToDownload: (datafile: Resource) => void;
}) {
    const created_at = new Date(datafile?.created ?? '');
    const last_updated = new Date(datafile?.metadata_modified ?? '');
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const;

    const tiles = useMemo(
        () => [...(datafile.data_api_tiles ?? [])].sort((a, b) => a.localeCompare(b)),
        [datafile.data_api_tiles]
    );

    const [selectedTilesForDownload, setSelectedTilesForDownload] = useState<Set<string>>(
        () => new Set(datafile.data_api_tiles ?? [])
    );

    // Keeps the download queue entry in sync with tile selection.
    // Removes any stale entry then adds a fresh one with the new tile list.
    const syncQueue = useCallback(
        (next: Set<string>) => {
            if (!selected) return;
            removeDatafileToDownload(datafile);
            if (next.size > 0) {
                addDatafileToDownload({ ...datafile, data_api_tiles: Array.from(next) });
            }
        },
        [selected, datafile, addDatafileToDownload, removeDatafileToDownload]
    );

    const toggleTileForDownload = useCallback(
        (name: string) => {
            setSelectedTilesForDownload((prev) => {
                const next = new Set(prev);
                if (next.has(name)) next.delete(name);
                else next.add(name);
                syncQueue(next);
                return next;
            });
        },
        [syncQueue]
    );

    const addTilesInAreaForDownload = useCallback(
        (names: string[]) => {
            setSelectedTilesForDownload((prev) => {
                const next = new Set(prev);
                for (const n of names) next.add(n);
                syncQueue(next);
                return next;
            });
        },
        [syncQueue]
    );

    const handleResourceCheckbox = () => {
        if (selected) {
            removeDatafileToDownload(datafile);
        } else {
            const toDownload =
                selectedTilesForDownload.size > 0 ? Array.from(selectedTilesForDownload) : tiles;
            addDatafileToDownload({ ...datafile, data_api_tiles: toDownload });
        }
    };

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

    const [tileQ, setTileQ] = useState('');
    const filteredTiles = useMemo(() => {
        if (!tileQ.trim()) return tiles;
        const q = tileQ.trim().toLowerCase();
        return tiles.filter((t) => t.toLowerCase().includes(q));
    }, [tiles, tileQ]);

    const [showDownloadForm, setShowDownloadForm] = useState(false);
    const [pendingDownloadUrl, setPendingDownloadUrl] = useState('');

    const createDownloadEvent = api.downloadEvents.createEvents.useMutation({
        onSuccess: () => {
            window.open(pendingDownloadUrl, '_target');
            setShowDownloadForm(false);
        },
        onError: () => {
            toast('Failed to send your information', { type: 'error' });
            window.open(pendingDownloadUrl, '_target');
            setShowDownloadForm(false);
        },
    });

    const handleFormSubmit = (data: DownloadEventForm) => {
        createDownloadEvent.mutate({
            ...data,
            resources: [datafile.id],
            package_id: datafile.package_id ?? '',
            acceptTerms: true,
            typeOfForm: 'direct-download',
            package_name: `${dataset.name}: ${datafile.title ?? datafile.name}`,
        });
    };

    const handleSkip = () => {
        window.open(pendingDownloadUrl, '_target');
        setShowDownloadForm(false);
    };

    const triggerDownload = (url: string) => {
        setPendingDownloadUrl(url);
        setShowDownloadForm(true);
    };

    return (
        <>
            <DirectDownloadPopup
                title="Download Data"
                isOpen={showDownloadForm}
                onClose={() => setShowDownloadForm(false)}
                dataset={dataset}
                onSubmit={handleFormSubmit}
                downloadButton={
                    <LoaderButton
                        loading={createDownloadEvent.isLoading}
                        className="whitespace-nowrap"
                        type="submit"
                    >
                        Submit
                    </LoaderButton>
                }
                skipButton={
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="whitespace-nowrap underline"
                    >
                        No thanks, proceed to download
                    </button>
                }
            />
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
                                {tiles.length > 0 && (
                                    <DefaultTooltip
                                        content={
                                            selected ? 'Remove from download' : 'Add to download'
                                        }
                                    >
                                        <input
                                            aria-label={`Select ${datafile.title ?? datafile.name}`}
                                            type="checkbox"
                                            className="h-4 w-4 rounded bg-white"
                                            checked={selected}
                                            onChange={handleResourceCheckbox}
                                        />
                                    </DefaultTooltip>
                                )}
                                <span
                                    className={classNames(
                                        'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                        'bg-violet-100'
                                    )}
                                >
                                    <span className="my-auto">Raster Tile Set</span>
                                </span>
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
                                </Disclosure.Button>
                            </div>
                            <div className="gap-x-2 hidden sm:flex">
                                <Disclosure.Button role="button" aria-label="expand">
                                    <ChevronDownIcon
                                        className={`${
                                            open ? 'rotate-180 transform transition' : ''
                                        } h-5 w-5 text-stone-900`}
                                    />
                                </Disclosure.Button>
                            </div>
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
                                <div className="mt-4 flex flex-col gap-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        {datafile.data_api_dataset_id && (
                                            <div className="rounded-md bg-white p-3 shadow ring-1 ring-gray-200">
                                                <span className="text-xs font-semibold uppercase text-neutral-400">
                                                    Dataset ID
                                                </span>
                                                <p className="mt-1 font-acumin font-semibold text-stone-900 break-all">
                                                    {datafile.data_api_dataset_id}
                                                </p>
                                            </div>
                                        )}
                                        {datafile.data_api_version && (
                                            <div className="rounded-md bg-white p-3 shadow ring-1 ring-gray-200">
                                                <span className="text-xs font-semibold uppercase text-neutral-400">
                                                    Version
                                                </span>
                                                <p className="mt-1 font-acumin font-semibold text-stone-900">
                                                    {datafile.data_api_version}
                                                </p>
                                            </div>
                                        )}
                                        {datafile.data_api_asset_id && (
                                            <div className="rounded-md bg-white p-3 shadow ring-1 ring-gray-200">
                                                <span className="text-xs font-semibold uppercase text-neutral-400">
                                                    Asset ID
                                                </span>
                                                <p className="mt-1 font-acumin font-semibold text-stone-900 break-all">
                                                    {datafile.data_api_asset_id}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {tiles.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <span className="font-acumin text-base font-normal text-black">
                                                    {tiles.length} TIFFs
                                                    {selectedTilesForDownload.size > 0 &&
                                                        selectedTilesForDownload.size <
                                                            tiles.length && (
                                                            <span className="ml-1 text-sm text-neutral-500">
                                                                ({selectedTilesForDownload.size}{' '}
                                                                selected for download)
                                                            </span>
                                                        )}
                                                </span>
                                                <div className="flex gap-x-3 text-sm">
                                                    {selectedTilesForDownload.size <
                                                        tiles.length && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = new Set(tiles);
                                                                setSelectedTilesForDownload(next);
                                                                syncQueue(next);
                                                            }}
                                                            className="underline text-black"
                                                        >
                                                            Select all
                                                        </button>
                                                    )}
                                                    {selectedTilesForDownload.size > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = new Set<string>();
                                                                setSelectedTilesForDownload(next);
                                                                syncQueue(next);
                                                            }}
                                                            className="underline text-black"
                                                        >
                                                            Deselect all
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 mb-4">
                                                <TileMapPreview
                                                    tileNames={tiles}
                                                    selectedTiles={selectedTilesForDownload}
                                                    onToggleTile={toggleTileForDownload}
                                                    onSelectTilesInArea={addTilesInAreaForDownload}
                                                />
                                            </div>
                                            <div className="mt-2 flex justify-between">
                                                <input
                                                    className="block w-full rounded-l-md py-2 pl-4 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                                                    onChange={(e) => setTileQ(e.target.value)}
                                                    value={tileQ}
                                                    placeholder="Search tiles by name"
                                                />
                                                <button
                                                    type="button"
                                                    className="bg-amber-400 px-3 rounded-l-none self-stretch flex items-center justify-center rounded-r-md border-1 border-l-0"
                                                >
                                                    <MagnifyingGlassIcon className="w-5 h-5 text-black" />
                                                </button>
                                            </div>
                                            {tileQ.trim() && (
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Showing {filteredTiles.length} of {tiles.length}
                                                </p>
                                            )}
                                            <div className="mt-2 flex max-h-72 flex-col gap-y-2 p-2 overflow-y-auto">
                                                {filteredTiles.map((tile) => {
                                                    const shortName = tile.split('/').pop() ?? tile;
                                                    const isChecked =
                                                        selectedTilesForDownload.has(tile);
                                                    const downloadUrl = tileToDownloadUrl(
                                                        tile,
                                                        datafile.data_api_dataset_id ?? '',
                                                        datafile.data_api_version ?? ''
                                                    );
                                                    return (
                                                        <div
                                                            key={tile}
                                                            className={classNames(
                                                                'flex items-center justify-between gap-3 rounded-md bg-white p-3 shadow ring-1',
                                                                isChecked
                                                                    ? 'ring-green-700'
                                                                    : 'ring-gray-200'
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <DefaultTooltip
                                                                    content={
                                                                        isChecked
                                                                            ? 'Remove from download'
                                                                            : 'Add to download'
                                                                    }
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        aria-label={`Select ${shortName}`}
                                                                        className="h-4 w-4 shrink-0 rounded bg-white"
                                                                        checked={isChecked}
                                                                        onChange={() =>
                                                                            toggleTileForDownload(
                                                                                tile
                                                                            )
                                                                        }
                                                                    />
                                                                </DefaultTooltip>
                                                                <span
                                                                    className={classNames(
                                                                        'hidden h-6 w-fit shrink-0 items-center justify-center rounded-sm px-2 text-center text-xs font-normal text-black md:flex',
                                                                        'bg-emerald-100'
                                                                    )}
                                                                >
                                                                    TIFF
                                                                </span>
                                                                <span className="font-acumin text-sm font-semibold text-stone-900 break-all">
                                                                    {shortName}
                                                                </span>
                                                            </div>
                                                            {downloadUrl && (
                                                                <Popover>
                                                                    <PopoverTrigger
                                                                        className="shrink-0 flex aspect-square flex-col items-center justify-center rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400 p-1.5"
                                                                        title={`Download ${shortName}`}
                                                                    >
                                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <Button
                                                                            className="w-full"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                triggerDownload(
                                                                                    downloadUrl
                                                                                )
                                                                            }
                                                                        >
                                                                            Original Format (TIFF)
                                                                        </Button>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Disclosure.Panel>
                        </Transition>
                    </div>
                )}
            </Disclosure>
        </>
    );
}
