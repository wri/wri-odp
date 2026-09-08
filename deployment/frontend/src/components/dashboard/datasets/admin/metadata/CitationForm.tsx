import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { DefaultTooltip } from '@/components/_shared/Tooltip';

export function CitationForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const { register } = formObj;

    return (
        <MetadataAccordion
            label={
                <>
                    <DocumentTextIcon className="h-7 w-7" />
                    Citation
                </>
            }
        >
            <Disclosure.Panel className="py-5">
                <InputGroup label="Citation" className="items-start">
                    <TextArea
                        aria-label="Citation"
                        placeholder=""
                        type="text"
                        {...register('citation')}
                        className="h-44"
                        icon={
                            <DefaultTooltip content="Provide a proper citation for this Dataset (e.g., author(s), year, title).">
                                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                            </DefaultTooltip>
                        }
                    />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
