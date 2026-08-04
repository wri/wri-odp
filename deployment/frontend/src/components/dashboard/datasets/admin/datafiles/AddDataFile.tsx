import { Tab } from '@headlessui/react';
import {
    ArrowUpTrayIcon,
    FolderPlusIcon,
    LinkIcon,
    GlobeAsiaAustraliaIcon,
    PaperClipIcon,
    MinusCircleIcon,
    Squares2X2Icon,
    RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import classNames from '@/utils/classnames';
import { LinkExternalForm } from './sections/LinkExternalForm';
import { UploadForm } from './sections/UploadForm';
import { useMemo, useRef } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { DataFileAccordion } from './DatafileAccordion';
import { match, P } from 'ts-pattern';
import { type DatasetFormType, type ResourceFormType } from '@/schema/dataset.schema';
import Uppy, { type UppyFile, type Meta } from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { getUploadParameters } from '@/utils/uppyFunctions';
import { v4 as uuidv4 } from 'uuid';
import { convertBytes } from '@/utils/convertBytes';
import { useDataDictionary } from '@/utils/getDataDictionary';
import { type Field } from 'tableschema';
import { TileCacheForm } from './sections/TileCacheForm';
import { GeeAssetForm } from './sections/GeeAssetForm';
import { DataApiDatasetForm } from './sections/DataApiDatasetForm';
import {
    getResourceOrdinal,
    isDataFileResource,
} from '@/utils/datasetResources';

export function AddDataFile({
    remove,
    field,
    index,
    formObj,
}: {
    remove: () => void;
    index: number;
    field: ResourceFormType;
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const { setValue, watch } = formObj;
    const datafile = watch(`resources.${index}`);
    const dataFileNumber = getResourceOrdinal(
        watch('resources') ?? [],
        index,
        isDataFileResource
    );
    const canRemove = !datafile?.isUploading;
    const uploadInputRef = useRef<HTMLInputElement>(null);
    // Stores the S3 key returned by sign-s3 BEFORE the upload completes.
    const pendingS3KeyRef = useRef<string | null>(null);
    // Stable refs so event handlers registered inside useMemo can access
    // current values without stale closures.
    const setValueRef = useRef(setValue);
    setValueRef.current = setValue;
    const indexRef = useRef(index);
    indexRef.current = index;

    const { isLoading: dataDictionaryLoading } = useDataDictionary(
        watch(`resources.${index}.fileBlob`),
        watch(`resources.${index}.resourceId`),
        (data) => {
            if (data) {
                const types = {
                    string: 'text',
                    number: 'numeric',
                    integer: 'numeric',
                    float: 'numeric',
                    date: 'timestamp',
                    time: 'timestamp',
                    datetime: 'timestamp',
                    year: 'numeric',
                    yearmonth: 'timestamp',
                    duration: 'numeric',
                } as const;
                const dataDictionary = data.map((item: Field, index: number) => ({
                    _id: index,
                    id: item.name,
                    info: {
                        label: item.name,
                        type_override: types[item.type as keyof typeof types],
                        default: '',
                    },
                }));
                setValue(`resources.${index}.schema`, dataDictionary);
            }
        },
        watch(`resources.${index}.fileBlob`)?.type === 'text/csv'
    );

    const uppy = useMemo(() => {
        const uppy = new Uppy({
            autoProceed: true,
            restrictions: {
                maxNumberOfFiles: 1,
            },
        }).use(AwsS3, {
            id: 'AwsS3',
            // Force single-part PUT uploads (presigned URL). Uppy v5 defaults
            // to multipart and requires createMultipartUpload/listParts/etc
            // when shouldUseMultipart is true.
            shouldUseMultipart: false,
            getUploadParameters: (file: UppyFile<Meta, Record<string, unknown>>) =>
                getUploadParameters(
                    file,
                    watch('team') && watch('team')?.value !== ''
                        ? `${watch('team')?.id}/ckan/resources/${datafile.resourceId}`
                        : `ckan/resources/${datafile.resourceId}`,
                    (key) => {
                        pendingS3KeyRef.current = key;
                    }
                ),
        });
        // Register all event handlers here so they are only registered once,
        // not on every render.  Use refs to access current form values.
        uppy.on('upload', () => {
            const idx = indexRef.current;
            const set = setValueRef.current;
            set(`resources.${idx}.type`, 'upload');
            set(`resources.${idx}.isUploading`, true);
        });

        // 'complete' fires once per upload batch (success OR failure) and is
        // the most reliable signal in Uppy v5 to know the upload is done.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uppy.on('complete' as any, (result: any) => {
            const idx = indexRef.current;
            const set = setValueRef.current;
            // Always clear the uploading flag, regardless of outcome.
            set(`resources.${idx}.isUploading`, false);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const successFile = result?.successful?.[0];
            const s3Key = pendingS3KeyRef.current;
            if (successFile && s3Key) {
                const name = s3Key.split('/').pop() ?? '';
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                set(`resources.${idx}.size`, successFile.size as number);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                set(`resources.${idx}.format`, successFile.extension as string);
                set(`resources.${idx}.key`, s3Key);
                set(`resources.${idx}.name`, name);
                pendingS3KeyRef.current = null;
            } else if (!s3Key) {
                console.error('[complete] S3 key was not captured');
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                console.error('[complete] upload failed', result?.failed);
            }
            if (uploadInputRef.current) uploadInputRef.current.value = '';
        });

        return uppy;
    }, []);

    function clearUppyFiles() {
        uppy.cancelAll();
        uppy.getFiles().forEach((file) => {
            uppy.removeFile(file.id);
        });
        pendingS3KeyRef.current = null;
        if (uploadInputRef.current) uploadInputRef.current.value = '';
    }

    function handleRemove() {
        clearUppyFiles();
        remove();
    }

    function handleResetUploadResource() {
        clearUppyFiles();
        setValue(`resources.${index}.isUploading`, false);
        setValue(`resources.${index}`, {
            resourceId: uuidv4(),
            title: '',
            type: 'empty-file',
            not_downloadable: false,
            schema: [],
            layerObj: null,
        });
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // This component keeps a stable Uppy instance; when re-uploading
        // after removing/resetting, clear previous file references first.
        clearUppyFiles();

        const slice = selectedFile.slice(0, 1000000);
        const slicedFile = new File([slice], selectedFile.name, {
            type: selectedFile.type,
        });
        setValue(`resources.${index}.fileBlob`, slicedFile);
        try {
            uppy.addFile({
                name: selectedFile.name,
                type: selectedFile.type,
                data: selectedFile,
            });
        } catch (error) {
            console.error('[addFile-error]', error);
            setValue(`resources.${index}.isUploading`, false);
        }
        // autoProceed: true handles the upload — no need to call uppy.upload()
    }

    return (
        <>
            <input
                ref={uploadInputRef}
                onChange={(e) => onInputChange(e)}
                type="file"
                className="hidden"
            />
            <DataFileAccordion
                remove={canRemove ? handleRemove : () => undefined}
                icon={<FolderPlusIcon className="h-7 w-7" />}
                title={`Data File ${dataFileNumber}`}
                id={`datafile-accordion-${datafile.id}`}
                preview={
                    <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
                        {match(datafile.type)
                            .with('upload', () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <PaperClipIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {datafile.name}
                                        </span>
                                        <span className="font-['Acumin Pro SemiCondensed'] mt-0.5 text-right text-xs font-normal leading-tight text-neutral-500">
                                            {datafile.size ? convertBytes(datafile.size) : 'N/A'}
                                        </span>
                                    </div>
                                    <button onClick={() => handleRemove()} disabled={!canRemove}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .with('link', () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <LinkIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {field.title}
                                        </span>
                                    </div>
                                    <button onClick={() => handleRemove()} disabled={!canRemove}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .with(P.union('layer', 'layer-raw'), () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {field.title}
                                        </span>
                                    </div>
                                    <button onClick={() => handleRemove()} disabled={!canRemove}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .otherwise(() => (
                                <>
                                    <div className="flex items-center gap-x-2"></div>
                                    <button onClick={() => handleRemove()} disabled={!canRemove}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))}
                    </div>
                }
            >
                <div className="px-4">
                    <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
                        <Tab.Group
                            selectedIndex={match(datafile.type)
                                .with('empty-file', () => 0)
                                .with('upload', () => 1)
                                .with('link', () => 2)
                                .with('tile-cache', () => 3)
                                .with('gee-asset', () => 4)
                                .with('data-api-dataset', () => 5)
                                .otherwise(() => 0)}
                        >
                            <Tab.List
                                as="div"
                                className={classNames(
                                    'grid max-w-[50rem] grid-cols-2 lg:grid-cols-5 gap-3 py-4',
                                    datafile.type === 'upload' ? 'hidden' : ''
                                )}
                            >
                                <Tab className="hidden" id="tabEmpty"></Tab>
                                <Tab
                                    onClick={() => uploadInputRef.current?.click()}
                                    id="tabUpload"
                                    className={classNames(
                                        'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                        datafile.type === 'upload' ? 'hidden' : ''
                                    )}
                                >
                                    <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                    <div
                                        className={classNames(
                                            'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm'
                                        )}
                                    >
                                        Upload file from my computer
                                    </div>
                                </Tab>
                                <Tab
                                    id="tabLink"
                                    onClick={() => setValue(`resources.${index}.type`, 'link')}
                                >
                                    {({ selected }) => (
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload' ? 'hidden' : ''
                                            )}
                                            id="link-button"
                                        >
                                            <LinkIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Link to file in cloud storage
                                            </div>
                                        </span>
                                    )}
                                </Tab>
                                <Tab
                                    id="tabLink"
                                    onClick={() =>
                                        setValue(`resources.${index}.type`, 'tile-cache')
                                    }
                                >
                                    {({ selected }) => (
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload' ? 'hidden' : ''
                                            )}
                                            id="tile-cache-link-button"
                                        >
                                            <Squares2X2Icon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Define a tile cache link
                                            </div>
                                        </span>
                                    )}
                                </Tab>
                                <Tab
                                    id="tabLink"
                                    onClick={() => setValue(`resources.${index}.type`, 'gee-asset')}
                                >
                                    {({ selected }) => (
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload' ? 'hidden' : ''
                                            )}
                                            id="gee-asset-button"
                                        >
                                            <GlobeAsiaAustraliaIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Link to GEE Asset
                                            </div>
                                        </span>
                                    )}
                                </Tab>
                                <Tab
                                    id="tabDataApiDataset"
                                    onClick={() =>
                                        setValue(`resources.${index}.type`, 'data-api-dataset')
                                    }
                                >
                                    {({ selected }) => (
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload' ? 'hidden' : ''
                                            )}
                                            id="data-api-dataset-button"
                                        >
                                            <RectangleGroupIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Link to Data API Raster Tile Set
                                            </div>
                                        </span>
                                    )}
                                </Tab>
                            </Tab.List>
                            <Tab.Panels as="div" className="mt-2">
                                <Tab.Panel className="hidden"></Tab.Panel>
                                <Tab.Panel>
                                    <UploadForm
                                        formObj={formObj}
                                        index={index}
                                        dataDictionaryLoading={dataDictionaryLoading}
                                        removeFile={handleResetUploadResource}
                                    />
                                </Tab.Panel>
                                <Tab.Panel>
                                    <LinkExternalForm formObj={formObj} index={index} />
                                </Tab.Panel>
                                <Tab.Panel>
                                    <TileCacheForm formObj={formObj} index={index} />
                                </Tab.Panel>
                                <Tab.Panel>
                                    <GeeAssetForm formObj={formObj} index={index} />
                                </Tab.Panel>
                                <Tab.Panel>
                                    <DataApiDatasetForm formObj={formObj} index={index} />
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </DataFileAccordion>
        </>
    );
}
