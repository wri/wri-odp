import {
    ArrowsPointingInIcon,
    ChatBubbleLeftRightIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure, Transition } from '@headlessui/react'
import { MetadataAccordion } from './MetadataAccordion'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid'

export function PointOfContactForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj
    const { fields: authorFields, append: appendAuthor, remove: removeAuthor } = useFieldArray({
        control,
        name: 'authors',
    })

    const { fields: maintainerFields, append: appendMaintainer, remove: removeMaintainer } = useFieldArray({
        control,
        name: 'maintainers',
    })

    const handleNewAuthor = () => {
        appendAuthor({ name: '', email: '' })
    }

    const handleNewMaintainer = () => {
        appendMaintainer({ name: '', email: '' })
    }

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
            <Disclosure.Panel className="py-5 flex flex-col gap-y-6">
                {/* Authors */}
                <h3 className="text-lg font-semibold">Authors<span className="text-red-500">*</span></h3>
                <div className="border-b border-gray-300 pb-4 mb-4">
                    {authorFields.length === 0 && (
                        <div>
                            <span className={errors.authors ? "text-red-600" : "text-gray-600"}>
                                <i>
                                    {errors.authors?.message || "At least one (1) Author Name and Author Email is required."}
                                </i>
                            </span>
                        </div>
                    )}
                    {authorFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-x-4 border-b border-gray-150 pb-4 mb-4">
                            <div className="flex flex-col gap-y-2 flex-grow">
                                <InputGroup label={<span >Author Name</span>}>
                                    <Input
                                        {...register(`authors.${index}.name`)}
                                        placeholder="Author Name"
                                        type="text"
                                    />
                                    {errors.authors?.[index]?.name && (
                                        <div>
                                            <span className="text-red-500"><i>{errors.authors[index].name.message}</i></span>
                                        </div>
                                    )}
                                </InputGroup>
                                <InputGroup label={<span >Author Email</span>}>
                                    <Input
                                        {...register(`authors.${index}.email`)}
                                        placeholder="email@example.com"
                                        type="email"
                                    />
                                    {errors.authors?.[index]?.email && (
                                        <div>
                                            <span className="text-red-500"><i>{errors.authors[index].email.message}</i></span>
                                        </div>
                                    )}
                                </InputGroup>
                            </div>
                            <button type="button" onClick={() => removeAuthor(index)} className="flex items-center gap-x-1 flex-shrink-0 whitespace-nowrap">
                                <MinusCircleIcon className="h-5 w-5 text-red-600" />
                                Remove Author
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button type="button" onClick={handleNewAuthor} className="pt-5 flex items-center justify-end gap-x-1">
                            <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                            Add Author
                        </button>
                    </div>
                </div>

                {/* Maintainers */}
                <h3 className="text-lg font-semibold">Maintainers<span className="text-red-500">*</span></h3>
                <div className="border-b border-gray-300 pb-4 mb-4">
                    {maintainerFields.length === 0 && (
                        <div>
                            <span className={errors.maintainers ? "text-red-600" : "text-gray-600"}>
                                <i>
                                    {errors.maintainers?.message || "At least one (1) Maintainer Name and Maintainer Email is required."}
                                </i>
                            </span>
                        </div>
                    )}
                    {maintainerFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-x-4 border-b border-gray-150 pb-4 mb-4">
                            <div className="flex flex-col gap-y-2 flex-grow">
                                <InputGroup label={<span >Maintainer Name</span>}>
                                    <Input
                                        {...register(`maintainers.${index}.name`)}
                                        placeholder="Maintainer Name"
                                        type="text"
                                    />
                                    {errors.maintainers?.[index]?.name && (
                                        <div>
                                            <span className="text-red-500"><i>{errors.maintainers[index].name.message}</i></span>
                                        </div>
                                    )}
                                </InputGroup>
                                <InputGroup label={<span >Maintainer Email</span>}>
                                    <Input
                                        {...register(`maintainers.${index}.email`)}
                                        placeholder="email@example.com"
                                        type="email"
                                    />
                                    {errors.maintainers?.[index]?.email && (
                                        <div>
                                            <span className="text-red-500"><i>{errors.maintainers[index].email.message}</i></span>
                                        </div>
                                    )}
                                </InputGroup>
                            </div>
                            <button type="button" onClick={() => removeMaintainer(index)} className="flex items-center gap-x-1 flex-shrink-0 whitespace-nowrap">
                                <MinusCircleIcon className="h-5 w-5 text-red-600" />
                                Remove Maintainer
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button type="button" onClick={handleNewMaintainer} className="pt-5 flex items-center justify-end gap-x-1">
                            <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                            Add Maintainer
                        </button>
                    </div>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
