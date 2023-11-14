import { Bars4Icon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure } from '@headlessui/react'
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export function DescriptionForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const {
        register,
        formState: { errors },
    } = formObj
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
                            <span>
                                Short Description{' '}
                                <span className="text-red-500">*</span>
                            </span>
                            <DefaultTooltip content="This is a short description of the dataset.">
                                <InformationCircleIcon
                                    className="h-5 w-5 text-neutral-500"
                                    aria-hidden="true"
                                />
                            </DefaultTooltip>
                        </div>
                    }
                    className="mb-2 flex-col items-start whitespace-nowrap sm:grid-cols-1 grid-cols-1 sm:flex-col sm:items-start sm:gap-y-2"
                >
                    <TextArea
                        placeholder=""
                        type="text"
                        {...register('short_description')}
                        className="h-44 col-span-full"
                    />
                    <ErrorDisplay name="short_description" errors={errors} />
                </InputGroup>
                <InputGroup
                    label={
                        <div className="flex items-center gap-x-1">
                            <span>Description</span>
                            <DefaultTooltip content="This is a longer description of the dataset, with rich text support">
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
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
