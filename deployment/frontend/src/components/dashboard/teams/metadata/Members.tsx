import {
    UseFieldArrayRemove,
    UseFormReturn,
    useFieldArray,
} from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { api } from '@/utils/api'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { MinusCircleIcon } from '@heroicons/react/24/outline'
import { InputGroup } from '../../datasets/admin/metadata/InputGroup'
import { match, P } from 'ts-pattern'
import Spinner from '@/components/_shared/Spinner'
import SimpleCombobox from '@/components/dashboard/_shared/SimpleCombobox'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { capacityOptions } from '../../datasets/admin/formOptions'
import notify from '@/utils/notify'
import { TeamFormType } from '@/schema/team.schema'
import { RouterOutput } from '@/server/api/root'

type TeamOutput = RouterOutput['teams']['getTeam']

export function Members({
    team,
    formObj,
}: {
    team: TeamOutput
    formObj: UseFormReturn<TeamFormType>
}) {
    const { control } = formObj
    const { fields, append, remove } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: 'members',
    })

    return (
        <div className="mx-auto w-full max-w-[1380px] sm:px-6 xxl:px-0">
            <div className="w-full border-b border-blue-800 bg-white shadow">
                <div className="col-span-full flex w-full justify-between border-b border-stone-50 py-5 px-4 sm:px-6">
                    <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                        Members
                    </h3>
                </div>
                <div className="py-4">
                    <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 pb-8">
                        <div className="flex flex-col gap-y-4">
                            {fields.map((field, index) => (
                                <MemberForm
                                    team={team}
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
                                    team_id: team.id,
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
                            <PlusCircleIcon className="h-5 w-5 text-amber-400 mt-6" />
                            <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black mt-6">
                                Add {fields.length > 0 ? 'another' : ''} member
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function MemberForm({
    formObj,
    index,
    remove,
    team,
}: {
    formObj: UseFormReturn<TeamFormType>
    index: number
    remove: UseFieldArrayRemove
    team: any
}) {
    const allUsers = api.teams.getPossibleMembers.useQuery(team)

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
                                name={`members.${index}.user`}
                                formObj={formObj}
                                options={data.map((user) => ({
                                    value: user.id,
                                    label: user.name,
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
                        name={`members.${index}.capacity`}
                        placeholder="Select capacity"
                        options={capacityOptions}
                    />
                </InputGroup>
            </div>
            <DefaultTooltip content="Remove member">
                <MinusCircleIcon
                    onClick={() => remove(index)}
                    className="h-5 w-5 text-red-600"
                />
            </DefaultTooltip>
        </div>
    )
}
