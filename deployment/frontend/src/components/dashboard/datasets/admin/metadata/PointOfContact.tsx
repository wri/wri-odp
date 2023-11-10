import {
    ArrowsPointingInIcon,
    ChatBubbleLeftRightIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure, Transition } from '@headlessui/react'
import { MetadataAccordion } from './MetadataAccordion'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'

export function PointOfContactForm({
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
                    <ChatBubbleLeftRightIcon className="h-7 w-7" />
                    Point of Contact
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Author Name" required>
                        <Input
                            {...register('authorName')}
                            placeholder="Example Man"
                            type="text"
                        />
                        <ErrorDisplay name="authorName" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Author Email" required>
                        <Input
                            {...register('authorEmail')}
                            placeholder="Global Forest Watch"
                            type="email"
                        ></Input>
                        <ErrorDisplay name="authorEmail" errors={errors} />
                    </InputGroup>
                </div>
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Maintainer Name" required>
                        <Input
                            {...register('maintainerName')}
                            placeholder="Another name"
                            type="text"
                        />
                        <ErrorDisplay name="maintainerName" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Maintainer Email" required>
                        <Input
                            {...register('maintainerEmail')}
                            placeholder="anotheremail@gmail.com"
                            type="email"
                        ></Input>
                        <ErrorDisplay name="maintainerEmail" errors={errors} />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
