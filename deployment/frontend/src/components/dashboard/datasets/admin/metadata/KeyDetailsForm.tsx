import {
    AdjustmentsHorizontalIcon,
    InformationCircleIcon,
    MinusCircleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { Input } from '@/components/_shared/SimpleInput';
import { SimpleEditor } from './RTE/SimpleEditor';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { api } from '@/utils/api';
import { P, match } from 'ts-pattern';
import Spinner from '@/components/_shared/Spinner';
import { datasetFormatInfoOptions, datasetTypeInfoOptions } from '../formOptions';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, index) =>
    String(currentYear - index)
);

export function KeyDetailsForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'extras',
    });
    const canAddMore = fields.length < 3;

    const possibleOwners = api.teams.getAllTeams.useQuery();
    const possibleLicenses = api.dataset.getLicenses.useQuery();

    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <AdjustmentsHorizontalIcon className="h-7 w-7" />
                    Key details
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup
                        label="Team"
                        required
                        info="Teams will only appear in the dropdown if you are an Admin or Editor of that Team. The padlock icon indicates the Team is private."
                    >
                        {match(possibleOwners)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />
                                    <span className="mt-1">Loading Teams...</span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Teams, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <SimpleSelect
                                        formObj={formObj}
                                        name="team"
                                        id="team"
                                        options={data.map((team) => ({
                                            label: team.title ?? team.name,
                                            value: team.name,
                                            id: team.id,
                                            visibility: team.visibility ?? 'public',
                                        }))}
                                        placeholder="Select a Team"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Teams, please refresh the page
                                </span>
                            ))}
                        <ErrorDisplay name="team" errors={errors} />
                    </InputGroup>

                    <InputGroup label="Temporal coverage">
                        <div className="flex flex-col items-center justify-between gap-5 lg:flex-row xxl:w-[28rem]">
                            <select
                                {...register('temporal_coverage_start', {
                                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                                })}
                                className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                            >
                                <option value="">Start year</option>
                                {yearOptions.map((year) => (
                                    <option key={`start-${year}`} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <span className="hidden xxl:block">to</span>
                            <select
                                {...register('temporal_coverage_end', {
                                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                                })}
                                className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                            >
                                <option value="">End year</option>
                                {yearOptions.map((year) => (
                                    <option key={`end-${year}`} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ErrorDisplay name="temporal_coverage_start" errors={errors} />
                        <ErrorDisplay name="temporal_coverage_end" errors={errors} />
                    </InputGroup>

                    <InputGroup label="Dataset type">
                        <SimpleSelect
                            id="dataset_type_info"
                            formObj={formObj}
                            name="dataset_type_info"
                            placeholder="Select dataset type"
                            options={datasetTypeInfoOptions}
                        />
                    </InputGroup>

                    <InputGroup label="Dataset format">
                        <SimpleSelect
                            id="dataset_format_info"
                            formObj={formObj}
                            name="dataset_format_info"
                            placeholder="Select dataset format"
                            options={datasetFormatInfoOptions}
                        />
                    </InputGroup>
                </div>

                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup
                        label="Licence"
                        info={
                            <span>
                                License definitions and additional information can be found at{' '}
                                <a href="http://opendefinition.org" target="_blank" rel="noreferrer">
                                    opendefinition.org
                                </a>
                                . The data license you select also applies to the contents of any
                                Data Files that you add to this Dataset.
                            </span>
                        }
                    >
                        {match(possibleLicenses)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />
                                    <span className="mt-1">Loading licenses...</span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading licenses, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <SimpleSelect
                                        name="license_id"
                                        id="license"
                                        formObj={formObj}
                                        options={data.map((license) => ({
                                            label: license.title,
                                            value: license.id,
                                        }))}
                                        placeholder="Select a license"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading licenses, please refresh the page
                                </span>
                            ))}
                        <ErrorDisplay name="license" errors={errors} />
                    </InputGroup>

                    <InputGroup
                        label="Custom attributes"
                        info="Add up to three key details that help users quickly understand this dataset."
                    >
                        <div className="flex flex-col gap-y-3 w-full">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                                >
                                    <Input
                                        placeholder="Attribute"
                                        {...register(`extras.${index}.key`)}
                                        type="text"
                                    />
                                    <Input
                                        placeholder="Value"
                                        {...register(`extras.${index}.value`)}
                                        type="text"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="inline-flex items-center justify-center text-red-600"
                                        aria-label="Remove custom attribute"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}

                            {canAddMore && (
                                <button
                                    type="button"
                                    onClick={() => append({ key: '', value: '' })}
                                    className="inline-flex items-center gap-x-2 text-wri-green"
                                >
                                    <PlusCircleIcon className="h-5 w-5" />
                                    Add custom attribute
                                </button>
                            )}
                        </div>
                    </InputGroup>

                    <InputGroup
                        label={
                            <span className="relative flex items-center gap-x-1">
                                Caution
                                <DefaultTooltip content="Describe any quality issues or limitations that data users should know about.">
                                    <InformationCircleIcon className="h-5 w-5" />
                                </DefaultTooltip>
                            </span>
                        }
                        className="mb-2 flex min-h-[280px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="cautions"
                            className="min-h-[280px]"
                            defaultValue=""
                        />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
