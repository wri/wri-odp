import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { SimpleEditor } from './RTE/SimpleEditor';

export function DatasetApiForm({ formObj }: { formObj: UseFormReturn<DatasetFormType> }) {
    return (
        <MetadataAccordion
            label={
                <>
                    <CodeBracketIcon className="h-7 w-7" />
                    Dataset API
                </>
            }
        >
            <Disclosure.Panel className="py-5">
                <InputGroup
                    label="Dataset API"
                    info="This field appears in the API tab of the dataset page. The string {% DATASET_URL %} is replaced with the current dataset URL."
                    contentClassName="max-w-sm whitespace-normal lg:max-w-xl"
                    className="min-h-[320px]"
                >
                    <SimpleEditor
                        formObj={formObj}
                        name="usecases"
                        className="min-h-[320px]"
                        defaultValue=""
                    />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
