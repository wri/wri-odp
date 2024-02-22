import {
    ClockIcon,
    FolderPlusIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { MetadataAccordion } from './MetadataAccordion'
import { DatasetFormType } from '@/schema/dataset.schema'
import { UseFormReturn } from 'react-hook-form'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { SimpleEditor } from './RTE/SimpleEditor'

export function VersioningForm({
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
                    <ClockIcon className="h-7 w-7" />
                    Versioning
                </>
            }
        >
            <Disclosure.Panel className="py-5 flex flex-col gap-y-4">
                <InputGroup
                    label={
                        <div className="flex items-center gap-x-1">
                            <span>
                                Release Notes{' '}
                            </span>
                            <DefaultTooltip content="Release notes describe to users what has changed since the last version">
                                <InformationCircleIcon
                                    className="h-5 w-5 text-neutral-500"
                                    aria-hidden="true"
                                />
                            </DefaultTooltip>
                        </div>
                    }
                    className="mb-2 flex  flex-col items-start whitespace-nowrap sm:flex-col"
                >
                    <SimpleEditor
                        placeholder=""
                        name="release_notes"
                        formObj={formObj}
                        className="min-h-[320px]"
                    />
                    <ErrorDisplay name="release_notes" errors={errors} />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
