import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import classNames from '@/utils/classnames';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Input } from '@/components/_shared/SimpleInput';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { useEffect, useMemo, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { api } from '@/utils/api';

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
        return tiles;
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
            setValue(`resources.${index}.data_api_tiles`, null, { shouldDirty: true });
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
                    placeholder="Add a short description"
                    {...register(`resources.${index}.description`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
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
                        maxWidth="max-w-md"
                    />
                    <button
                        type="button"
                        disabled={dataApiFetching}
                        onClick={() => {
                            void fetchDataApiVersions();
                        }}
                        className="h-10 whitespace-nowrap rounded-md bg-blue-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-900 disabled:opacity-50"
                    >
                        {dataApiFetching ? 'Loading...' : 'Get Versions'}
                    </button>
                </div>
            </InputGroup>
            {dataApiError && (
                <p className="mt-2 text-sm text-red-600">{dataApiError}</p>
            )}
            {dataApiVersions.length > 0 && (
                <div className="mt-8 shadow-md">
                    <span className="font-acumin text-base p-4 font-normal text-black flex items-center gap-x-1">
                        {dataApiVersions.length} Versions
                    </span>
                    <div className="mt-2 flex max-h-72 flex-col gap-y-4 overflow-y-auto">
                        {dataApiVersions.map((v) => (
                            <div
                                key={v}
                                className={classNames(
                                    'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                                    selectedVersion === v ? 'bg-slate-100' : ''
                                )}
                            >
                                <div className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            aria-label={`Select version ${v}`}
                                            type="radio"
                                            name={`data-api-version-${index}`}
                                            checked={selectedVersion === v}
                                            onChange={() => {
                                                void fetchDataApiAssets(v);
                                            }}
                                            className="h-4 w-4 accent-blue-800"
                                        />
                                        <span
                                            className={classNames(
                                                'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                                'bg-sky-100'
                                            )}
                                        >
                                            <span className="my-auto">
                                                Version
                                            </span>
                                        </span>
                                        <h3 className="font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900">
                                            {v}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
                <div className="mt-8 shadow-md">
                    <span className="font-acumin text-base p-4 font-normal text-black flex items-center gap-x-1">
                        {dataApiAssets.length} Raster tile sets for{' '}
                        {selectedVersion}
                    </span>
                    {dataApiAssets.length === 0 ? (
                        <p className="mt-2 p-4 text-sm text-neutral-500">
                            No raster tile sets found for this version.
                        </p>
                    ) : (
                        <div className="mt-2 flex max-h-72 flex-col gap-y-4 overflow-y-auto">
                            {dataApiAssets.map((asset) => (
                                <div
                                    key={asset.asset_id}
                                    className={classNames(
                                        'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                                        selectedAssetId === asset.asset_id
                                            ? 'bg-slate-100'
                                            : ''
                                    )}
                                >
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                aria-label={`Select asset ${asset.asset_uri}`}
                                                type="radio"
                                                name={`data-api-asset-${index}`}
                                                checked={
                                                    selectedAssetId ===
                                                    asset.asset_id
                                                }
                                                onChange={() => {
                                                    void fetchTilesInfo(
                                                        asset.asset_id
                                                    );
                                                }}
                                                className="h-4 w-4 accent-blue-800"
                                            />
                                            <span
                                                className={classNames(
                                                    'hidden h-7 w-fit p-2 items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                                    'bg-amber-100'
                                                )}
                                            >
                                                {asset.asset_type}
                                            </span>
                                            <div>
                                                <h3 className="font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 break-all">
                                                    {asset.asset_uri}
                                                </h3>
                                                <p className="font-acumin text-xs text-neutral-400">
                                                    {asset.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
