import { Bars4Icon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure } from '@headlessui/react'
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'

export function DescriptionForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    return (
        <MetadataAccordion
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
                            <span>
                                Short Description{' '}
                                <span className="text-red-500">*</span>
                            </span>
                            <ExclamationCircleIcon
                                className="h-5 w-5 text-neutral-500"
                                aria-hidden="true"
                            />
                        </div>
                    }
                    className="mb-2 flex-col items-start whitespace-nowrap sm:grid-cols-1 grid-cols-1 sm:flex-col sm:items-start sm:gap-y-2"
                >
                    <TextArea
                        placeholder=""
                        name="citation"
                        type="text"
                        className="h-44 col-span-full"
                    />
                </InputGroup>
                <InputGroup
                    label={
                        <div className="flex items-center gap-x-1">
                            <span>Description</span>
                            <ExclamationCircleIcon
                                className="h-5 w-5 text-neutral-500"
                                aria-hidden="true"
                            />
                        </div>
                    }
                    className="mb-2 flex h-[350px] flex-col items-start whitespace-nowrap sm:flex-col"
                >
                    <SimpleEditor
                        formObj={formObj}
                        name="longDescription"
                        defaultValue=""
                    />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
