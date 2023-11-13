import {
    ExclamationCircleIcon,
    InformationCircleIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { InputGroup } from '@/components/_shared/InputGroup'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Input } from '@/components/_shared/SimpleInput'

export function MoreDetailsForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { register } = formObj
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
                    <InputGroup label="Learn more" className="items-start">
                        <Input
                            placeholder="Please visit our website for more information: LINK TO WEBSITE"
                            {...register('learn_more')}
                            type="text"
                        />
                    </InputGroup>
                    <InputGroup label="Function" className="items-start">
                        <TextArea
                            placeholder="This data serves X porpuse"
                            {...register('function')}
                            type="text"
                            className="h-28"
                        />
                    </InputGroup>
                    <InputGroup label="Restrictions" className="items-start">
                        <TextArea
                            placeholder="Data can only be used without alteration"
                            {...register('restrictions')}
                            type="text"
                            className="h-28"
                        />
                    </InputGroup>
                    <InputGroup
                        label="Reason for adding"
                        className="items-start"
                    >
                        <TextArea
                            placeholder="Due to new funding for research"
                            {...register('reason_for_adding')}
                            type="text"
                            className="h-28"
                        />
                    </InputGroup>
                <InputGroup label="Cautions" className="items-start">
                    <TextArea
                        placeholder=""
                        {...register('cautions')}
                        type="text"
                        className="h-64"
                        icon={
                            <DefaultTooltip content="Placeholder">
                                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                            </DefaultTooltip>
                        }
                    />
                </InputGroup>
                <InputGroup label="Summary" className="items-start">
                    <TextArea
                        placeholder="My short summary of this data"
                        type="text"
                        {...register('summary')}
                        className="h-64"
                    />
                </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
