import {
    InformationCircleIcon,
    GlobeAmericasIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from '@/utils/classnames';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Input } from '@/components/_shared/SimpleInput';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Disclosure, Listbox, Transition } from '@headlessui/react';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { api } from '@/utils/api';
import { Button } from '@/components/_shared/Button';
import dynamic from 'next/dynamic';
import DefaultTooltip from '@/components/_shared/Tooltip';

const TileLocationSelect = dynamic(() => import('./TileLocationSelect'), {
    ssr: false,
});

export function DataApiDatasetForm({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    index: number;
}) {
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = formObj;
    const apiUtils = api.useUtils();

    const dataApiDatasetId = watch(`resources.${index}.data_api_dataset_id`) ?? '';
    const selectedVersion = watch(`resources.${index}.data_api_version`) ?? null;
    const selectedAssetId = watch(`resources.${index}.data_api_asset_id`) ?? null;
    const selectedTilesRaw = watch(`resources.${index}.data_api_tiles`);
    const selectedTiles = useMemo(() => new Set(selectedTilesRaw ?? []), [selectedTilesRaw]);

    const [dataApiVersions, setDataApiVersions] = useState<string[]>([]);
    const [dataApiFetching, setDataApiFetching] = useState(false);
    const [dataApiError, setDataApiError] = useState<string | null>(null);
    const [dataApiAssets, setDataApiAssets] = useState<
        Array<{
            asset_id: string;
            asset_type: string;
            asset_uri: string;
            status: string;
        }>
    >([]);
    const [assetsFetching, setAssetsFetching] = useState(false);
    const [assetsError, setAssetsError] = useState<string | null>(null);
    const [tileNames, setTileNames] = useState<string[]>([]);
    const [tilesFetching, setTilesFetching] = useState(false);
    const [tilesError, setTilesError] = useState<string | null>(null);
    const [tileSearchQuery, setTileSearchQuery] = useState('');
    const [showOnlySelectedTiles, setShowOnlySelectedTiles] = useState(false);

    const filteredTiles = useMemo(() => {
        let tiles = tileNames;
        if (showOnlySelectedTiles) {
            tiles = tiles.filter((t) => selectedTiles.has(t));
        }
        if (tileSearchQuery.trim()) {
            const q = tileSearchQuery.trim().toLowerCase();
            tiles = tiles.filter((t) => t.toLowerCase().includes(q));
        }
        return [...tiles].sort((a, b) => a.localeCompare(b));
    }, [tileNames, selectedTiles, showOnlySelectedTiles, tileSearchQuery]);

    function toggleTile(name: string) {
        const next = new Set(selectedTiles);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        setValue(
            `resources.${index}.data_api_tiles`,
            Array.from(next),
            { shouldDirty: true }
        );
    }

    function setAllTiles(tiles: string[]) {
        setValue(
            `resources.${index}.data_api_tiles`,
            tiles,
            { shouldDirty: true }
        );
    }

    function addTilesToSelection(names: string[]) {
        if (names.length === 0) return;
        const next = new Set(selectedTiles);
        for (const n of names) next.add(n);
        setAllTiles(Array.from(next));
    }

    useEffect(() => {
        async function restoreApiData() {
            if (!dataApiDatasetId) return;
            try {
                const res = await fetch(
                    `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(dataApiDatasetId)}`
                );
                if (res.ok) {
                    const json = (await res.json()) as {
                        data?: { versions?: string[] };
                    };
                    setDataApiVersions(json.data?.versions ?? []);
                }
            } catch {
                /* silent — user can re-fetch manually */
            }

            if (!selectedVersion) return;
            try {
                const res = await fetch(
                    `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(dataApiDatasetId)}/${encodeURIComponent(selectedVersion)}/assets?asset_type=${encodeURIComponent('Raster tile set')}`
                );
                if (res.ok) {
                    const json = (await res.json()) as {
                        data?: Array<{
                            asset_id: string;
                            asset_type: string;
                            asset_uri: string;
                            status: string;
                        }>;
                    };
                    setDataApiAssets(json.data ?? []);
                }
            } catch {
                /* silent */
            }

            if (!selectedAssetId) return;
            try {
                const names = await apiUtils.dataApi.getTilesInfo.fetch({
                    assetId: selectedAssetId,
                });
                setTileNames(names);
            } catch {
                /* silent */
            }
        }

        void restoreApiData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchDataApiVersions() {
        const id = dataApiDatasetId.trim();
        if (!id) return;
        setDataApiFetching(true);
        setDataApiError(null);
        try {
            const res = await fetch(
                `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(id)}`
            );
            const json = (await res.json()) as {
                data?: { versions?: string[] };
                message?: string;
            };
            if (!res.ok) {
                const detail = json.message ?? res.statusText;
                setDataApiError(`Error ${res.status}: ${detail}`);
                setDataApiVersions([]);
                setDataApiAssets([]);
                return;
            }
            setDataApiVersions(json.data?.versions ?? []);
            setDataApiAssets([]);
            setTileNames([]);
            setValue(`resources.${index}.data_api_dataset_id`, id, { shouldDirty: true });
            setValue(`resources.${index}.data_api_version`, null, { shouldDirty: true });
            setValue(`resources.${index}.data_api_asset_id`, null, { shouldDirty: true });
            setValue(`resources.${index}.data_api_tiles`, null, { shouldDirty: true });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            setDataApiError(`Network error: ${message}`);
            setDataApiVersions([]);
            setDataApiAssets([]);
        } finally {
            setDataApiFetching(false);
        }
    }

    async function fetchDataApiAssets(version: string) {
        setAssetsFetching(true);
        setAssetsError(null);
        try {
            const res = await fetch(
                `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(dataApiDatasetId.trim())}/${encodeURIComponent(version)}/assets?asset_type=${encodeURIComponent('Raster tile set')}`
            );
            const json = (await res.json()) as {
                data?: Array<{
                    asset_id: string;
                    asset_type: string;
                    asset_uri: string;
                    status: string;
                }>;
                message?: string;
            };
            if (!res.ok) {
                const detail = json.message ?? res.statusText;
                setAssetsError(`Error ${res.status}: ${detail}`);
                setDataApiAssets([]);
                return;
            }
            setDataApiAssets(json.data ?? []);
            setTileNames([]);
            setValue(`resources.${index}.data_api_version`, version, { shouldDirty: true });
            setValue(`resources.${index}.data_api_asset_id`, null, { shouldDirty: true });
            setValue(`resources.${index}.data_api_tiles`, null, { shouldDirty: true });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            setAssetsError(`Network error: ${message}`);
            setDataApiAssets([]);
        } finally {
            setAssetsFetching(false);
        }
    }

    async function fetchTilesInfo(assetId: string) {
        setTilesFetching(true);
        setTilesError(null);
        try {
            const names = await apiUtils.dataApi.getTilesInfo.fetch({
                assetId,
            });
            setTileNames(names);
            setTileSearchQuery('');
            setShowOnlySelectedTiles(false);
            setValue(`resources.${index}.data_api_asset_id`, assetId, { shouldDirty: true });
            setValue(`resources.${index}.data_api_tiles`, names, { shouldDirty: true });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            setTilesError(message);
            setTileNames([]);
        } finally {
            setTilesFetching(false);
        }
    }

    return (
        <div className="flex flex-col gap-y-4 py-4">
            <InputGroup label="Title" required className="whitespace-nowrap">
                <Input
                    placeholder="Data file title"
                    {...register(`resources.${index}.title`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay
                    name={`resources.${index}.title`}
                    errors={errors}
                />
            </InputGroup>
            <InputGroup label="Description" className="whitespace-nowrap">
                <TextArea
                    placeholder="Describe this downloadable file"
                    {...register(`resources.${index}.description`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                    icon={
                        <DefaultTooltip content="Describe what this downloadable file contains so users know what to expect before adding it to their download. Avoid repeating dataset-level information. For example, explain if a ZIP archive contains multiple data tables, documentation or supporting resources.">
                            <InformationCircleIcon className="h-5 w-5" />
                        </DefaultTooltip>
                    }
                />
            </InputGroup>
            <InputGroup
                label="Dataset ID"
                required
                className="whitespace-nowrap"
            >
                <div className="flex items-center gap-x-2">
                    <Input
                        type="text"
                        placeholder="e.g. landmark_indigenous_and_community_lands"
                        {...register(`resources.${index}.data_api_dataset_id`)}
                    />
                    <button
                        type="button"
                        disabled={dataApiFetching}
                        onClick={() => {
                            void fetchDataApiVersions();
                        }}
                        className="h-12 whitespace-nowrap rounded-md bg-blue-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-900 disabled:opacity-50"
                    >
                        {dataApiFetching ? 'Loading...' : 'Get Versions'}
                    </button>
                </div>
            </InputGroup>
            {dataApiError && (
                <p className="mt-2 text-sm text-red-600">{dataApiError}</p>
            )}
            {dataApiVersions.length > 0 && (
                <InputGroup label="Version" required className="whitespace-nowrap">
                    <Listbox
                        value={selectedVersion}
                        onChange={(v: string) => {
                            void fetchDataApiAssets(v);
                        }}
                    >
                        {({ open }) => (
                            <div className="relative w-full max-w-md">
                                <Listbox.Button className="relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6">
                                    <span className="block truncate">
                                        {selectedVersion ?? 'Select a version'}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    show={open}
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {dataApiVersions.map((v) => (
                                            <Listbox.Option
                                                key={v}
                                                value={v}
                                                className={({ active }) =>
                                                    classNames(
                                                        active ? 'bg-blue-800 text-white' : 'text-gray-900',
                                                        'relative cursor-default select-none py-2 pl-3 pr-9'
                                                    )
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                                        {v}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        )}
                    </Listbox>
                </InputGroup>
            )}
            {assetsError && (
                <p className="mt-2 text-sm text-red-600">{assetsError}</p>
            )}
            {assetsFetching && (
                <p className="mt-3 text-sm text-neutral-500">
                    Loading assets...
                </p>
            )}
            {!assetsFetching && selectedVersion && !assetsError && (
                <InputGroup label="Raster Tile Set" required className="whitespace-nowrap">
                    {dataApiAssets.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                            No raster tile sets found for this version.
                        </p>
                    ) : (
                        <Listbox
                            value={selectedAssetId}
                            onChange={(assetId: string) => {
                                void fetchTilesInfo(assetId);
                            }}
                        >
                            {({ open }) => (
                                <div className="relative w-full">
                                    <Listbox.Button className="relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6">
                                        <span className="block truncate">
                                            {selectedAssetId
                                                ? (dataApiAssets.find((a) => a.asset_id === selectedAssetId)?.asset_uri ?? selectedAssetId)
                                                : 'Select a raster tile set'}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </Listbox.Button>
                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {dataApiAssets.map((asset) => (
                                                <Listbox.Option
                                                    key={asset.asset_id}
                                                    value={asset.asset_id}
                                                    className={({ active }) =>
                                                        classNames(
                                                            active ? 'bg-blue-800 text-white' : 'text-gray-900',
                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                        )
                                                    }
                                                >
                                                    {({ selected, active }) => (
                                                        <div>
                                                            <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                                                {asset.asset_uri}
                                                            </span>
                                                            <span className={classNames(active ? 'text-blue-200' : 'text-neutral-400', 'block truncate text-xs')}>
                                                                {asset.status}
                                                            </span>
                                                        </div>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            )}
                        </Listbox>
                    )}
                </InputGroup>
            )}
            {tilesError && (
                <p className="mt-2 text-sm text-red-600">{tilesError}</p>
            )}
            {tilesFetching && (
                <p className="mt-3 text-sm text-neutral-500">
                    Loading tiles...
                </p>
            )}
            {!tilesFetching && selectedAssetId && !tilesError && (
                <div className="mt-4">
                    {tileNames.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                            No TIFFs found for this asset.
                        </p>
                    ) : (
                        <>
                            <div className="py-4">
                                <div className="flex justify-between">
                                    <input
                                        className="block w-full rounded-l-md py-3 pl-4 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                                        onChange={(e) =>
                                            setTileSearchQuery(e.target.value)
                                        }
                                        value={tileSearchQuery}
                                        placeholder="Search tiles by name"
                                    />
                                    <button
                                        type="button"
                                        className="bg-amber-400 px-3 rounded-l-none self-stretch flex items-center justify-center rounded-r-md border-1 border-l-0"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5 text-black" />
                                    </button>
                                </div>
                                <Disclosure defaultOpen>
                                    {({ open }) => (
                                        <>
                                            <Disclosure.Button as={Fragment}>
                                                <Button
                                                    type="button"
                                                    className="my-2 ml-auto group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3"
                                                >
                                                    {open
                                                        ? 'Collapse map'
                                                        : 'Select tiles by location'}
                                                    <GlobeAmericasIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                                                </Button>
                                            </Disclosure.Button>
                                            <Disclosure.Panel
                                                unmount={false}
                                                className="pb-3 w-full"
                                            >
                                                <TileLocationSelect
                                                    open={open}
                                                    tileNames={tileNames}
                                                    selectedTiles={
                                                        selectedTiles
                                                    }
                                                    onToggleTile={toggleTile}
                                                    onSelectTilesInArea={
                                                        addTilesToSelection
                                                    }
                                                />
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            </div>
                            <span className="font-acumin text-base font-normal text-black flex items-center gap-x-1">
                                {filteredTiles.length} TIFFs{' '}
                                {selectedTiles.size > 0 && (
                                    <span className="flex items-center">
                                        ({selectedTiles.size} Selected TIFFs)
                                    </span>
                                )}
                            </span>
                            <div className="flex justify-end pb-1 lg:flex-col xl:flex-row">
                                <div className="flex gap-x-4 lg:justify-end">
                                    {selectedTiles.size > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowOnlySelectedTiles(
                                                    !showOnlySelectedTiles
                                                )
                                            }
                                            className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                        >
                                            {showOnlySelectedTiles
                                                ? 'Show All'
                                                : 'Show Selected'}
                                        </button>
                                    )}
                                    {selectedTiles.size <
                                        tileNames.length && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAllTiles([...tileNames])
                                            }
                                            className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                        >
                                            Select all TIFFs
                                        </button>
                                    )}
                                    {selectedTiles.size > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOnlySelectedTiles(false);
                                                setAllTiles([]);
                                            }}
                                            className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                        >
                                            Unselect all TIFFs
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex max-h-96 flex-col gap-y-4 overflow-y-auto">
                                {filteredTiles.map((name) => {
                                    const shortName =
                                        name.split('/').pop() ?? name;
                                    const isSelected = selectedTiles.has(name);
                                    return (
                                        <div
                                            key={name}
                                            className={classNames(
                                                'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                                                isSelected
                                                    ? 'bg-slate-100'
                                                    : ''
                                            )}
                                        >
                                            <div className="flex flex-row items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        aria-label={`Select ${shortName}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded bg-white"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            toggleTile(name)
                                                        }
                                                    />
                                                    <span
                                                        className={classNames(
                                                            'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                                            'bg-emerald-100'
                                                        )}
                                                    >
                                                        <span className="my-auto">
                                                            TIFF
                                                        </span>
                                                    </span>
                                                    <h3 className="font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 break-all">
                                                        {shortName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
