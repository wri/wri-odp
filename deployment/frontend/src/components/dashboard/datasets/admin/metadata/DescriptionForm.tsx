import { Bars4Icon } from '@heroicons/react/24/outline';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Disclosure } from '@headlessui/react';
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';

export function DescriptionForm({ formObj }: { formObj: UseFormReturn<DatasetFormType> }) {
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
                    label="Description"
                    info="Describe what the dataset contains, its intended use, and any important limitations users should know before downloading. For detailed documentation, use the Methodology section or Additional Reading resources. Maximum: 1,500 characters."
                >
                    <SimpleEditor formObj={formObj} name="notes" defaultValue="" />
                    <ErrorDisplay name="notes" errors={errors} />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
