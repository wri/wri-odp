import { Bars4Icon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Disclosure } from '@headlessui/react';
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';

export function DescriptionForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        formState: { errors },
    } = formObj;
    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <Bars4Icon className="h-7 w-7" />
                    Description
                </>
            }
        >
            <Disclosure.Panel className="flex flex-col gap-y-8 pb-12 pt-5">
                <InputGroup
                    label={
                        <div className="flex items-center gap-x-1">
                            <span>Description</span>
                            <DefaultTooltip content="Describe what this dataset contains, its intended use, and any important limitations users should know before downloading. For detailed documentation, use the Methodology section or Additional reading resources.">
                                <InformationCircleIcon
                                    className="h-5 w-5 text-neutral-500"
                                    aria-hidden="true"
                                />
                            </DefaultTooltip>
                        </div>
                    }
                    className="mb-2 flex min-h-[350px] flex-col items-start whitespace-nowrap sm:flex-col"
                >
                    <SimpleEditor
                        formObj={formObj}
                        name="notes"
                        defaultValue=""
                    />
                    <ErrorDisplay name="notes" errors={errors} />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
