import { CodeBracketIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { SimpleEditor } from './RTE/SimpleEditor';

export function DatasetApiForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
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
                    label={
                        <span className="relative flex items-center gap-x-1">
                            Dataset API
                            <DefaultTooltip
                                contentClassName="max-w-sm whitespace-normal lg:max-w-xl"
                                side="right"
                                content="This field appears in the API tab of the dataset page. The string {% DATASET_URL %} is replaced with the current dataset URL."
                            >
                                <InformationCircleIcon className="h-5 w-5" />
                            </DefaultTooltip>
                        </span>
                    }
                    className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
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
