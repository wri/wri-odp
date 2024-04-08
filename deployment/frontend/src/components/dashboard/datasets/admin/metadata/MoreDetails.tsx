import {
    ExclamationCircleIcon,
    InformationCircleIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Input } from '@/components/_shared/SimpleInput'
import { SimpleEditor } from './RTE/SimpleEditor'

export function MoreDetailsForm({
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
            label={
                <>
                    <SquaresPlusIcon className="h-7 w-7" />
                    More Details
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup
                        label="Learn more"
                        className="mb-2 flex flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <Input
                            placeholder="Please visit our website for more information: LINK TO WEBSITE"
                            {...register('learn_more')}
                            type="text"
                        />
                        <ErrorDisplay name="learn_more" errors={errors} />
                    </InputGroup>
                    <InputGroup
                        label="Function"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="function"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Restrictions"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="restrictions"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Reason for adding"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="reason_for_adding"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Cautions"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="cautions"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Methodology"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="methodology"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label={
                            <span className="relative flex items-center gap-x-1">
                                Advanced API Usage
                                    <DefaultTooltip
                                        contentClassName="max-w-sm whitespace-normal lg:max-w-xl"
                                        side="right"
                                        content="This field will end up next to the API tab in the dataset page, you can use it to provide code samples that are useful for this particular data, the string {% DATASET_URL %} will get replaced with the actual url for this particular dataset"
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
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
