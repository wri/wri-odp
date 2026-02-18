import { Button, LoaderButton } from '@/components/_shared/Button';
import classNames from '@/utils/classnames';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  FingerPrintIcon,
  GlobeAmericasIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { DownloadButton } from './datafiles/Download';
import { OpenInButton } from './datafiles/OpenIn';
import { type Resource, type View } from '@/interfaces/dataset.interface';
import { getFormatColor } from '@/utils/formatColors';
import { type Index } from 'flexsearch';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import { useLayersFromRW } from '@/utils/queryHooks';
import { useActiveCharts, useActiveLayerGroups } from '@/utils/storeHooks';
import { type TabularResource } from '../visualizations/Visualizations';
import { APIButton } from './datafiles/API';
import { UseFormReturn, useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import DefaultTooltip from '@/components/_shared/Tooltip';
import { toast } from 'react-toastify';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/_shared/Popover';
import { env } from '@/env.mjs';
import { DownloadPopup } from '@/components/_shared/DownloadPopup';
import dynamic from 'next/dynamic';
import { QueryEndpoint } from './APIEndpoint';

const LocationSearch = dynamic(() => import('./LocationSearch'), {
  ssr: false,
});

function customDataLayer(data: { event: string; resource_name: string }) {
  if (env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
    //@ts-ignore
    dataLayer.push({
      event: data.event,
      resource_name: data.resource_name,
    });
  }
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
    (r) => r.url_type === 'upload' || r.url_type === 'link'
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

  const keys = datafilesToDownload
    .map((r) => r.key ?? r.url)
    .filter(Boolean) as string[];
  const handleFormSubmit = (data: any) => {
    downloadZipped.mutate(
      {
        email: data.email,
        dataset_id: dataset.id,
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
                <Disclosure.Button as={Fragment}>
                  <Button className="my-2 ml-auto group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3">
                    {open
                      ? 'Collapse'
                      : 'Open Filter by Location'}
                    <GlobeAmericasIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                  </Button>
                </Disclosure.Button>
                <Disclosure.Panel
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
                </Disclosure.Panel>
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
            (r) => r.url_type === 'upload' || r.url_type === 'link'
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

function DatafileCard({
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
  const { removeLayerFromLayerGroup, addLayerToLayerGroup } =
    useActiveLayerGroups();

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
          (diffField) =>
            diffField[field] &&
            diffField[field]?.new_value === value
        )
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };
  const newDatafile = () => {
    if (diffFields && !isCurrentVersion) {
      if (
        diffFields[index] &&
        diffFields[index]?.undefined?.old_value === null
      ) {
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
              {['upload', 'link'].includes(
                datafile.url_type ?? ''
              ) &&
                datafile.not_downloadable !== true && (
                  <DefaultTooltip content="Select to download">
                    <input
                      aria-label={`Select ${datafile.title}`}
                      type="checkbox"
                      className="h-4 w-4  rounded  bg-white "
                      checked={selected}
                      onChange={() => {
                        if (selected) {
                          removeDatafileToDownload(
                            datafile
                          );
                        } else {
                          addDatafileToDownload(
                            datafile
                          );
                        }
                      }}
                    />
                  </DefaultTooltip>
                )}
              {['upload', 'link'].includes(
                datafile.url_type ?? ''
              ) &&
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
                  <span className="my-auto">
                    {datafile.format}
                  </span>
                </span>
              )}
              <Disclosure.Button>
                <h3
                  className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${datafile.title
                      ? higlighted(
                        'title',
                        datafile.title
                      )
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
              {['layer', 'layer-raw', 'reference-layer'].includes(
                datafile.type
              ) && (
                  <>
                    {activeLayers.some((a) => {
                      return (
                        datafile.url?.endsWith(a?.id) ||
                        datafile.id === a?.id
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
                            datafile.layerObj
                              ?.layerConfig ||
                            datafile.layerObjRaw
                              ?.layerConfig
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
                                datafile.rw_id !=
                                null
                                ? datafile.rw_id
                                : datafile.id,
                              dataset.id,
                              'rw'
                            );
                          }
                          customDataLayer({
                            event: 'gtm.click',
                            resource_name:
                              datafile.title ??
                              datafile.name!,
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
                      onClick={() =>
                        setTabularResource(null)
                      }
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
                          datasetName:
                            dataset.title ??
                            dataset.name,
                          id: datafile.id,
                          name:
                            datafile?.title ??
                            datafile.name!,
                        });

                        customDataLayer({
                          event: 'gtm.click',
                          resource_name:
                            datafile.title ??
                            datafile.name!,
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
                    activeCharts
                      .map((c: View) => c.id)
                      .includes(v.id)
                  ) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const viewIds =
                          datafile._views?.map(
                            (v: View) => v.id
                          );
                        if (viewIds) {
                          removeCharts(
                            viewIds as string[]
                          );
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
                      data-resource={
                        datafile.title ?? datafile.name!
                      }
                      onClick={() => {
                        if (datafile._views)
                          addCharts(datafile._views);

                        //@ts-ignore
                        customDataLayer({
                          event: 'gtm.click',
                          resource_name:
                            datafile.title ??
                            datafile.name!,
                        });
                      }}
                    >
                      View Chart Preview
                    </Button>
                  )}
                </>
              )}

              <Disclosure.Button
                role="button"
                aria-label="expand"
              >
                <ChevronDownIcon
                  className={`${open
                      ? 'rotate-180 transform  transition'
                      : ''
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
                        datafile.url?.endsWith(a.id) ||
                        datafile.id === a.id
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
                            if (
                              !mapDisplaypreview
                            ) {
                              setMapDisplayPreview(
                                true
                              );
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
                              datafile.title ??
                              datafile.name!,
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
                        onClick={() =>
                          setTabularResource(null)
                        }
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
                            datasetName:
                              dataset.title ??
                              dataset.name,
                            id: datafile.id,
                            name:
                              datafile?.title ??
                              datafile.name!,
                          });

                          customDataLayer({
                            event: 'gtm.click',
                            resource_name:
                              datafile.title ??
                              datafile.name!,
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
                      activeCharts
                        .map((c: View) => c.id)
                        .includes(v.id)
                    ) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const viewIds =
                            datafile._views?.map(
                              (v: View) => v.id
                            );
                          if (viewIds) {
                            removeCharts(
                              viewIds as string[]
                            );
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
                          if (datafile._views)
                            addCharts(
                              datafile._views
                            );

                          customDataLayer({
                            event: 'gtm.click',
                            resource_name:
                              datafile.title ??
                              datafile.name!,
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
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="py-3">
              <p
                className={`font-acumin text-base font-light text-stone-900 ${datafile.description
                    ? higlighted(
                      'description',
                      datafile.description
                    )
                    : ''
                  }`}
              >
                {datafile.description ?? 'No Description'}
              </p>
              <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {created_at.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {last_updated.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
              </div>
              <div className="grid max-w-[30rem] grid-cols-3 gap-x-3 py-4 ">
                {datafile.url_type === 'link' ||
                  datafile.url_type === 'upload' ? (
                  <>
                    <DownloadButton
                      datafile={datafile}
                      dataset={dataset}
                    />
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

function TilecacheCard({
  datafile,
  dataset,
  diffFields,
  isCurrentVersion,
  index,
}: {
  datafile: Resource;
  dataset: WriDataset;
  isCurrentVersion?: boolean;
  diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
  index: number;
}) {
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
          (diffField) =>
            diffField[field] &&
            diffField[field]?.new_value === value
        )
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };
  const newDatafile = () => {
    if (diffFields && !isCurrentVersion) {
      if (
        diffFields[index] &&
        diffFields[index]?.undefined?.old_value === null
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);
    const handleClick = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <DefaultTooltip
        content={
          copied ? 'Tile Cache URL copied!' : 'Copy Tile Cache URL'
        }
        contentClassName={`${copied ? 'bg-wri-green text-white' : ''}`}
        delayDuration={copied ? 0 : 100}
        onOpenChange={(open) => {
          if (copied && open) return;
        }}
        open={copied ? true : undefined}
      >
        <Button
          aria-label="copy button"
          className={`h-auto rounded-full p-2`}
          onClick={handleClick}
        >
          <DocumentDuplicateIcon className="w-3 text-white" />
        </Button>
      </DefaultTooltip>
    );
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
              <DefaultTooltip content="Not selectable for direct download">
                <input
                  aria-label={`Select ${datafile.title}`}
                  type="checkbox"
                  className="h-4 w-4  rounded  bg-gray-200 border-gray-300"
                  disabled
                  checked={false}
                />
              </DefaultTooltip>
              {datafile?.cache_type && (
                <span
                  className={classNames(
                    'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                    getFormatColor(
                      datafile?.cache_type ?? ''
                    )
                  )}
                >
                  <span className="my-auto capitalize">
                    {datafile.cache_type}
                  </span>
                </span>
              )}
              <Disclosure.Button>
                <h3
                  className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${datafile.title
                      ? higlighted(
                        'title',
                        datafile.title
                      )
                      : higlighted('name', datafile.name!)
                    }`}
                >
                  {datafile.title ?? datafile.name}
                </h3>
              </Disclosure.Button>
            </div>
            <div className="gap-x-2 hidden sm:flex">
              <Disclosure.Button
                role="button"
                aria-label="expand"
              >
                <ChevronDownIcon
                  className={`${open
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
              <p
                className={`font-acumin text-base font-light text-stone-900 ${datafile.description
                    ? higlighted(
                      'description',
                      datafile.description
                    )
                    : ''
                  }`}
              >
                {datafile.description ?? 'No Description'}
              </p>
              <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {created_at.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {last_updated.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <QueryEndpoint
                  description="Copy the tile cache link for use in your GIS application"
                  url={datafile.url ?? ''}
                  method={''}
                  copyButton={
                    <CopyButton
                      content={datafile.url ?? ''}
                    />
                  }
                />
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}

function GeeAssetCard({
  datafile,
  dataset,
  diffFields,
  isCurrentVersion,
  index,
}: {
  datafile: Resource;
  dataset: WriDataset;
  isCurrentVersion?: boolean;
  diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
  index: number;
}) {
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
          (diffField) =>
            diffField[field] &&
            diffField[field]?.new_value === value
        )
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };
  const newDatafile = () => {
    if (diffFields && !isCurrentVersion) {
      if (
        diffFields[index] &&
        diffFields[index]?.undefined?.old_value === null
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);
    const handleClick = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <DefaultTooltip
        content={copied ? 'Asset ID copied!' : 'Copy Asset ID'}
        contentClassName={`${copied ? 'bg-wri-green text-white' : ''}`}
        delayDuration={copied ? 0 : 100}
        onOpenChange={(open) => {
          if (copied && open) return;
        }}
        open={copied ? true : undefined}
      >
        <Button
          aria-label="copy button"
          className={`h-auto rounded-full p-2`}
          onClick={handleClick}
        >
          <DocumentDuplicateIcon className="w-3 text-white" />
        </Button>
      </DefaultTooltip>
    );
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
              <DefaultTooltip content="Not selectable for direct download">
                <input
                  aria-label={`Select ${datafile.title}`}
                  type="checkbox"
                  className="h-4 w-4  rounded  bg-gray-200 border-gray-300"
                  disabled
                  checked={false}
                />
              </DefaultTooltip>
              {datafile?.asset_type && (
                <span
                  className={classNames(
                    'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                    getFormatColor(
                      datafile?.asset_type ?? ''
                    )
                  )}
                >
                  <span className="my-auto capitalize">
                    {datafile.asset_type}
                  </span>
                </span>
              )}
              <Disclosure.Button>
                <h3
                  className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${datafile.title
                      ? higlighted(
                        'title',
                        datafile.title
                      )
                      : higlighted('name', datafile.name!)
                    }`}
                >
                  {datafile.title ?? datafile.name}
                </h3>
              </Disclosure.Button>
            </div>
            <div className="gap-x-2 hidden sm:flex">
              <Disclosure.Button
                role="button"
                aria-label="expand"
              >
                <ChevronDownIcon
                  className={`${open
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
              <p
                className={`font-acumin text-base font-light text-stone-900 ${datafile.description
                    ? higlighted(
                      'description',
                      datafile.description
                    )
                    : ''
                  }`}
              >
                {datafile.description ?? 'No Description'}
              </p>
              <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {created_at.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {last_updated.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <QueryEndpoint
                  description="Copy the Google Earth Engine snippet for use in the Earth Engine Code Editor."
                  url={datafile.asset_id ?? ''}
                  method={''}
                  copyButton={
                    <CopyButton
                      content={datafile.asset_id ?? ''}
                    />
                  }
                />
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}
