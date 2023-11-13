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
            defaultOpen
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
                            {...register('author')}
                            placeholder="Example Man"
                            type="text"
                        />
                        <ErrorDisplay name="author" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Author Email" required>
                        <Input
                            {...register('author_email')}
                            placeholder="Global Forest Watch"
                            type="email"
                        ></Input>
                        <ErrorDisplay name="author_email" errors={errors} />
                    </InputGroup>
                </div>
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Maintainer Name" required>
                        <Input
                            {...register('maintainer')}
                            placeholder="Another name"
                            type="text"
                        />
                        <ErrorDisplay name="maintainer" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Maintainer Email" required>
                        <Input
                            {...register('maintainer_email')}
                            placeholder="anotheremail@gmail.com"
                            type="email"
                        ></Input>
                        <ErrorDisplay name="maintainer_email" errors={errors} />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
