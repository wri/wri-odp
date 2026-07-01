import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Button, LoaderButton } from '@/components/_shared/Button';
import {
  ArrowDownCircleIcon,
  GlobeAmericasIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { type Resource } from '@/interfaces/dataset.interface';
import { type Index } from 'flexsearch';
import {
  Fragment,
  useMemo,
  useState,
} from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import { useLayersFromRW } from '@/utils/queryHooks';
import { useActiveLayerGroups } from '@/utils/storeHooks';
import { type TabularResource } from '../visualizations/Visualizations';
import { useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { DownloadPopup } from '@/components/_shared/DownloadPopup';
import dynamic from 'next/dynamic';
import { DatafileCard } from './datafiles/cards/DatafileCard';
import { TilecacheCard } from './datafiles/cards/TilecacheCard';
import { GeeAssetCard } from './datafiles/cards/GeeAssetCard';
import { DataApiDatasetCard } from './datafiles/cards/DataApiDatasetCard';

const LocationSearch = dynamic(() => import('./LocationSearch'), {
  ssr: false,
});

function tileToGfwDownloadUrl(
  tilePath: string,
  datasetId: string,
  version: string
): string | null {
  const parts = tilePath.split('/');
  if (parts.length < 12) return null;

  const filename = parts[parts.length - 1];
  const format = parts[parts.length - 2];
  const pixelMeaning = parts[parts.length - 3];
  const grid2 = parts[parts.length - 4];
  const grid1 = parts[parts.length - 5];

  const tileId = filename?.replace(/\.[^.]+$/, '');
  if (!tileId || !format || !pixelMeaning || !grid1 || !grid2) return null;

  return `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(datasetId)}/${encodeURIComponent(version)}/download/${encodeURIComponent(format)}?grid=${grid1}/${grid2}&tile_id=${tileId}&pixel_meaning=${pixelMeaning}`;
}

export interface LocationSearchFormType {
  bbox: Array<Array<number>> | null;
  point: Array<number> | null;
  location: string;
}

export function DataFiles({
  dataset,
  index,
  setTabularResource,
  setDisplayNoPreview,
  tabularResource,
  isCurrentVersion,
  diffFields,
  mapDisplaypreview,
  setMapDisplayPreview,
}: {
  dataset: WriDataset;
  index: Index;
  setTabularResource: (tabularResource: TabularResource | null) => void;
  setDisplayNoPreview: (displayNoPreview: boolean) => void;
  setMapDisplayPreview: (mapDisplaypreview: boolean) => void;
  mapDisplaypreview: boolean;
  tabularResource: TabularResource | null;
  isCurrentVersion?: boolean;
  diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
}) {
  const { addLayerToLayerGroup, removeLayerFromLayerGroup } =
    useActiveLayerGroups();
  const { data: activeLayers } = useLayersFromRW();
  const [datafilesToDownload, setDatafilesToDownload] = useState<Resource[]>(
    []
  );
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  function addDatafilesToDownload(resources: Resource[]) {
    const existingResources = datafilesToDownload.filter((resource) =>
      resources.some((r) => r.id === resource.id)
    );
    setDatafilesToDownload((prev) => [
      ...prev.filter((resource) => !existingResources.includes(resource)),
      ...resources,
    ]);
  }
  const datafiles = dataset?.resources;
  const formObj = useForm<LocationSearchFormType>({
    defaultValues: {
      bbox: null,
      point: null,
      location: '',
    },
  });
  const { data: searchedResources, isLoading: isLoadingLocationSearch } =
    api.dataset.resourceLocationSearch.useQuery(
      {
        bbox: formObj.watch('bbox'),
        point: formObj.watch('point'),
        location: formObj.watch('location'),
        package_id: dataset.name,
        is_pending: false,
      },
      {
        onSuccess: (data) => {
          addDatafilesToDownload(data ?? []);
          formObj.reset();
        },
      }
    );
  const [q, setQ] = useState('');

  function handleSearch() {
    const filteredDatafilesByName =
      q !== ''
        ? datafiles?.filter((datafile) =>
          index.search(q).includes(datafile.id)
        )
        : [];
    addDatafilesToDownload(filteredDatafilesByName);
  }

  const geojsons = useMemo(() => {
    return datafiles
      .filter((r) => r.spatial_type !== 'global')
      .filter((r) => r.spatial_address || r.spatial_geom)
      .map((df) => ({
        ...df.spatial_geom,
        address: df.spatial_address,
        selected: datafilesToDownload.some((f) => f.id === df.id),
        id: df.id,
        datafile: df,
      }));
  }, [datafilesToDownload]);

  const datafileList = useMemo(() => {
    if (!showOnlySelected) {
      return datafiles;
    }
    return datafiles.filter((d) =>
      datafilesToDownload.some((r) => r.id === d.id)
    );
  }, [datafilesToDownload, showOnlySelected]);

  const addDatafileToDownload = (datafile: Resource) => {
    setDatafilesToDownload((prev) => [...prev, datafile]);
  };
  const removeDatafileToDownload = (datafile: Resource) => {
    setDatafilesToDownload((prev) =>
      prev.filter((r) => r.id !== datafile.id)
    );
  };

  const toggleDatafileToDownload = (datafile: Resource) => {
    if (datafilesToDownload.some((f) => f.id === datafile.id)) {
      removeDatafileToDownload(datafile);
    } else {
      addDatafileToDownload(datafile);
    }
  };

  const uploadedDatafiles = datafiles.filter(
    (r) =>
      r.url_type === 'upload' ||
      r.url_type === 'link' ||
      (r.type === 'data-api-dataset' && (r.data_api_tiles?.length ?? 0) > 0)
  );

  const downloadZipped = api.dataset.downloadZippedResources.useMutation();
  const createDownloadEvent = api.downloadEvents.createEvents.useMutation({
    onError: (err) => {
      toast('Failed to send your information', {
        type: 'error',
      });
      setOpenDownload(false);
    },
  });

  const resourceIds = datafilesToDownload
    .filter((r) => r.type !== 'data-api-dataset')
    .map((r) => r.id)
    .filter(Boolean);

  const keys = datafilesToDownload.flatMap((r) => {
    if (r.type === 'data-api-dataset') {
      const tiles = r.data_api_tiles ?? [];
      const dsId = r.data_api_dataset_id;
      const ver = r.data_api_version;
      if (!dsId || !ver) return [];
      return tiles
        .map((t) => tileToGfwDownloadUrl(t, dsId, ver))
        .filter(Boolean) as string[];
    }
    return [r.key ?? r.url].filter(Boolean) as string[];
  });

  const handleFormSubmit = (data: any) => {
    downloadZipped.mutate(
      {
        email: data.email,
        dataset_id: dataset.id,
        resource_ids: resourceIds,
        keys,
      },
      {
        onSuccess: () => {
          const _data = {
            ...data,
            resources: datafilesToDownload.map((r) => r.id),
            package_id: dataset.id ?? '',
            typeOfForm: 'email-download',
            package_name: dataset.name,
          };
          createDownloadEvent.mutate(_data);
          toast("You'll receive an email when the file is ready", {
            type: 'success',
          });
          setOpenDownload(false);
        },
        onError: (err) => {
          console.error(err);
          toast('Failed to request file', {
            type: 'error',
          });
        },
      }
    );
  };
  const [openDownload, setOpenDownload] = useState(false);
  const notDownloadable = uploadedDatafiles.filter(
    (r) => r.not_downloadable === true
  );
  return (
    <>
      <div className="py-4">
        <div className="flex justify-between">
          <input
            className="block w-full rounded-l-md py-3 pl-4 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
            onChange={(e) => setQ(e.target.value)}
            value={q}
            placeholder="Search Data Files by title or description"
          />
          <Button
            onClick={handleSearch}
            className="bg-amber-400 px-3 rounded-l-none h-full flex items-center justify-center rounded-r-md border-1 border-l-0"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-black" />
          </Button>
        </div>
        {dataset.is_approved && geojsons.length > 0 && (
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <DisclosureButton as={Fragment}>
                  <Button className="my-2 ml-auto group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3">
                    {open
                      ? 'Collapse'
                      : 'Open Filter by Location'}
                    <GlobeAmericasIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                  </Button>
                </DisclosureButton>
                <DisclosurePanel
                  unmount={false}
                  className="pb-3 w-full"
                >
                  <div>
                    <LocationSearch
                      toggleDatafileToDownload={
                        toggleDatafileToDownload
                      }
                      open={open}
                      geojsons={geojsons}
                      formObj={formObj}
                    />
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        )}
      </div>
      <span className="font-acumin text-base font-normal text-black flex items-center gap-x-1">
        {datafiles?.length ?? 0} Data Files{' '}
        {datafilesToDownload.length > 0 ? (
          <span className="flex items-center">
            {isLoadingLocationSearch && (
              <svg
                className="animate-spin mx-1 h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}{' '}
            ({datafilesToDownload.length} Selected Data Files
            {notDownloadable.length > 0
              ? `, ${notDownloadable.length} not available to download)`
              : ')'}
          </span>
        ) : (
          ''
        )}
      </span>
      <div className="flex justify-end pb-1 lg:flex-col xl:flex-row">
        <div className="flex gap-x-4 lg:justify-end">
          {datafilesToDownload.length > 0 && (
            <button
              onClick={() =>
                setShowOnlySelected(!showOnlySelected)
              }
              className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
            >
              {showOnlySelected ? 'Show All' : 'Show Selected'}
            </button>
          )}
          {datafiles.some(
            (r) =>
              r.url_type === 'upload' ||
              r.url_type === 'link' ||
              (r.type === 'data-api-dataset' && (r.data_api_tiles?.length ?? 0) > 0)
          ) && (
              <>
                {' '}
                {datafilesToDownload.length !==
                  uploadedDatafiles.length && (
                    <button
                      onClick={() =>
                        setDatafilesToDownload(
                          uploadedDatafiles.filter(
                            (r) =>
                              r.not_downloadable !== true
                          )
                        )
                      }
                      className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                    >
                      Select all Data Files
                    </button>
                  )}
                {datafilesToDownload.length > 0 && (
                  <button
                    onClick={() => {
                      setShowOnlySelected(false);
                      setDatafilesToDownload([]);
                    }}
                    className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                  >
                    Unselect all Data Files
                  </button>
                )}
              </>
            )}
          {datafiles.filter(
            (r) =>
              r.url_type === 'layer' || r.url_type === 'layer-raw'
          ).length > 1 && (
              <>
                <button
                  onClick={() => {
                    dataset.resources.forEach((r) => {
                      if (
                        r.format == 'Layer' &&
                        r.rw_id &&
                        // @ts-ignore
                        !activeLayers.some(
                          (l) => l.id == r?.rw_id
                        )
                      ) {
                        addLayerToLayerGroup(
                          r.rw_id ?? '',
                          dataset.id
                        );
                      }
                    });
                  }}
                  className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                >
                  Show All Layers
                </button>
                <button
                  className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                  onClick={() => {
                    dataset.resources.forEach((r) => {
                      if (r.format == 'Layer') {
                        removeLayerFromLayerGroup(
                          // @ts-ignore
                          r.rw_id,
                          dataset.id
                        );
                      }
                    });
                  }}
                >
                  Hide All Layers
                </button>
              </>
            )}
        </div>
      </div>
      {datafilesToDownload.length > 0 && (
        <Button
          onClick={() => setOpenDownload(true)}
          className="group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3"
        >
          Download Selected Data Files
          <ArrowDownCircleIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
        </Button>
      )}
      <div className="flex flex-col gap-y-4">
        {datafiles?.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="font-acumin text-base font-normal text-black">
              No Data Files found
            </p>
          </div>
        ) : (
          <>
            {datafileList.map((datafile, index) => {
              if (datafile.type === 'tile-cache') {
                return (
                  <TilecacheCard
                    datafile={datafile}
                    dataset={dataset}
                    diffFields={diffFields}
                    isCurrentVersion={isCurrentVersion}
                    index={index}
                  />
                );
              }
              if (datafile.type === 'gee-asset') {
                return (
                  <GeeAssetCard
                    datafile={datafile}
                    dataset={dataset}
                    diffFields={diffFields}
                    isCurrentVersion={isCurrentVersion}
                    index={index}
                  />
                );
              }
              if (datafile.type === 'data-api-dataset') {
                return (
                  <DataApiDatasetCard
                    key={datafile.id}
                    datafile={datafile}
                    dataset={dataset}
                    diffFields={diffFields}
                    isCurrentVersion={isCurrentVersion}
                    index={index}
                    selected={datafilesToDownload.some(
                      (r) => r.id === datafile.id
                    )}
                    addDatafileToDownload={addDatafileToDownload}
                    removeDatafileToDownload={removeDatafileToDownload}
                  />
                );
              }
              return (
                <DatafileCard
                  setMapDisplayPreview={setMapDisplayPreview}
                  mapDisplaypreview={mapDisplaypreview}
                  tabularResource={tabularResource}
                  setTabularResource={setTabularResource}
                  selected={datafilesToDownload.some(
                    (r) => r.id === datafile.id
                  )}
                  addDatafileToDownload={
                    addDatafileToDownload
                  }
                  removeDatafileToDownload={
                    removeDatafileToDownload
                  }
                  key={datafile.id}
                  datafile={datafile}
                  dataset={dataset}
                  diffFields={diffFields}
                  isCurrentVersion={isCurrentVersion}
                  index={index}
                />
              );
            })}
          </>
        )}
      </div>
      <DownloadPopup
        title="The selected Data Files are being prepared for download"
        subtitle="Please enter your information so that you receive the download link via email"
        isOpen={openDownload}
        onClose={() => setOpenDownload(false)}
        dataset={dataset}
        onSubmit={handleFormSubmit}
        downloadButton={
          <LoaderButton
            className="whitespace-nowrap"
            type="submit"
            loading={downloadZipped.isLoading}
          >
            Submit
          </LoaderButton>
        }
      />
    </>
  );
}
