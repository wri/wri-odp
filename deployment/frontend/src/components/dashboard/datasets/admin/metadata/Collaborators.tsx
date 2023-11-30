import {
    UseFieldArrayRemove,
    UseFormRegister,
    UseFormReturn,
    useFieldArray,
} from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DatasetFormType } from '@/schema/dataset.schema'
import { api } from '@/utils/api'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { MinusCircleIcon } from '@heroicons/react/24/outline'
import { InputGroup } from './InputGroup'
import { match, P } from 'ts-pattern'
import Spinner from '@/components/_shared/Spinner'
import SimpleCombobox from '@/components/dashboard/_shared/SimpleCombobox'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { capacityOptions } from '../formOptions'
import { WriDataset } from '@/schema/ckan.schema'
import notify from '@/utils/notify'

export function Collaborators({
    dataset,
    formObj,
}: {
    dataset: WriDataset
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { control, watch, register } = formObj
    const { fields, append, prepend, remove, swap, move, insert } =
        useFieldArray({
            control, // control props comes from useForm (optional: if you are using FormContext)
            name: 'collaborators',
        })
    return (
        <div className="mx-auto w-full max-w-[1380px] sm:px-6 xxl:px-0">
            <div className="w-full border-b border-blue-800 bg-white shadow">
                <div className="col-span-full flex w-full justify-between border-b border-stone-50 py-5 px-4 sm:px-6">
                    <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                        Collaborators
                    </h3>
                </div>
                <div className="py-4">
                    <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 pb-8">
                        <div className="flex flex-col gap-y-4">
                            {fields.map((field, index) => (
                                <CollaboratorForm
                                    dataset={dataset}
                                    key={field.id}
                                    index={index}
                                    remove={remove}
                                    formObj={formObj}
                                />
                            ))}
                        </div>
                        <button
              type="button"
                            onClick={() =>
                                append({
                                    package_id: dataset.id,
                                    user: {
                                        value: '',
                                        label: '',
                                    },
                                    capacity: {
                                        label: 'Member',
                                        value: 'member',
                                    },
                                })
                            }
                            className="ml-auto flex items-center justify-end gap-x-1"
                        >
                            <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                            <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                                Add {fields.length > 0 ? 'another' : ''}{' '}
                                collaborator
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CollaboratorForm({
    formObj,
    index,
    remove,
    dataset,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
    remove: UseFieldArrayRemove
    dataset: WriDataset
}) {
    const { register, watch } = formObj
    const allUsers = api.dataset.getPossibleCollaborators.useQuery()
    const removeCollaborator = api.dataset.removeCollaborator.useMutation({
        onSuccess: async () => {
            notify(`Successfully removed the collaborator`, 'success')
            remove(index)
        },
        onError: (error) => {
            notify(`Couldnt remove collaborator: ${error.message}`, 'error')
        },
    })
    return (
        <div className="flex items-center gap-x-2">
            <div className="grid grow grid-cols-1 items-start gap-x-24 md:grid-cols-2">
                <InputGroup label="User">
                    {match(allUsers)
                        .with({ isLoading: true }, () => (
                            <span className="flex items-center text-sm gap-x-2">
                                <Spinner />{' '}
                                <span className="mt-1">Loading users...</span>
                            </span>
                        ))
                        .with({ isError: true }, () => (
                            <span className="flex items-center text-sm text-red-600">
                                Error loading users, please refresh the page
                            </span>
                        ))
                        .with({ isSuccess: true, data: P.select() }, (data) => (
                            <SimpleCombobox
                                name={`collaborators.${index}.user`}
                                formObj={formObj}
                                options={data
                                    .filter(
                                        (user) =>
                                            user.id !== dataset.creator_user_id
                                    )
                                    .filter(
                                        (user) =>
                                            !watch('collaborators').some(
                                                (collaborator) =>
                                                    collaborator.user.value ===
                                                    user.id
                                            )
                                    )
                                    .map((user) => ({
                                        label: user.name,
                                        value: user.id,
                                    }))}
                                placeholder="Select a user"
                            />
                        ))
                        .otherwise(() => (
                            <span className="flex items-center text-sm text-red-600">
                                Error loading users, please refresh the page
                            </span>
                        ))}
                </InputGroup>
                <InputGroup label="Capacity">
                    <SimpleSelect
                        formObj={formObj}
                        name={`collaborators.${index}.capacity`}
                        placeholder="Select capacity"
                        options={capacityOptions}
                    />
                </InputGroup>
            </div>
            <DefaultTooltip content="Remove collaborator">
                {removeCollaborator.isLoading ? (
                    <Spinner />
                ) : (
                    <MinusCircleIcon
                        onClick={() =>
                            removeCollaborator.mutate({
                                user_id:
                                    watch('collaborators')[index]?.user.value ??
                                    '',
                                id: dataset.id,
                            })
                        }
                        className="h-5 w-5 text-red-600"
                    />
                )}
            </DefaultTooltip>
        </div>
    )
}
