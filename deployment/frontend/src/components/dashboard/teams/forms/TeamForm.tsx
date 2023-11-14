import { UseFormReturn } from 'react-hook-form'
import { TeamFormType } from '@/schema/team.schema'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { ImageUploader } from '../../_shared/ImageUploader'
import { UploadResult } from '@uppy/core'
import { api } from '@/utils/api'
import { P, match } from 'ts-pattern'
import Spinner from '@/components/_shared/Spinner'

export default function TeamForm({
    formObj,
    editing = false,
}: {
    formObj: UseFormReturn<TeamFormType>
    editing?: boolean
}) {
    const {
        register,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = formObj
    const possibleParents = api.teams.getAllTeams.useQuery()
    return (
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
            <div className="flex flex-col justify-start gap-y-4">
                <InputGroup label="Title" required>
                    <Input
                        {...register('title')}
                        placeholder="My team"
                        type="text"
                    />
                    <ErrorDisplay name="title" errors={errors} />
                </InputGroup>
                <InputGroup label="URL" required>
                    <Input
                        {...register('name')}
                        disabled={editing}
                        placeholder="name-of-team"
                        type="text"
                        className="pl-[4.6rem] lg:pl-[4rem]"
                    >
                        <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                            /teams/
                        </span>
                    </Input>
                    <ErrorDisplay name="name" errors={errors} />
                </InputGroup>
                <InputGroup
                    label="Image"
                    className="items-start justify-start gap-x-[2.7rem]"
                >
                    <div className="col-span-full lg:col-span-2">
                        <div className="w-[11rem]">
                            <ImageUploader
                                clearImage={() => setValue('image_url', '')}
                                defaultImage={watch('image_url') && watch('image_display_url')}
                                onUploadSuccess={(response: UploadResult) => {
                                    const url =
                                        response.successful[0]?.uploadURL ??
                                        null
                                    const name = url ? url.split('/').pop() : ''
                                    setValue('image_url', name)
                                }}
                            />
                        </div>
                    </div>
                </InputGroup>
            </div>
            <div className="flex flex-col justify-start gap-y-4">
                <InputGroup
                    label="Description"
                    labelClassName="pt-[0.9rem]"
                    className="items-start"
                >
                    <TextArea
                        placeholder="Description"
                        {...register('description')}
                        type="text"
                        className="h-[8.4rem]"
                    />
                    <ErrorDisplay name="description" errors={errors} />
                </InputGroup>
                <InputGroup
                    label="Parent"
                    labelClassName="pt-[0.9rem]"
                    className="items-start"
                >
                    {match(possibleParents)
                        .with({ isLoading: true }, () => (
                            <span className="flex items-center text-sm gap-x-2">
                                <Spinner />{' '}
                                <span className="mt-1">Loading parents...</span>
                            </span>
                        ))
                        .with({ isError: true }, () => (
                            <span className="flex items-center text-sm text-red-600">
                                Error loading parents, please refresh the page
                            </span>
                        ))
                        .with({ isSuccess: true, data: P.select() }, (data) => (
                            <SimpleSelect
                                formObj={formObj}
                                name="parent"
                                options={[{ label: 'No parent', value: '' }, ...data.map((team) => ({
                                    label: team.title ?? team.name,
                                    value: team.name,
                                    default: watch('parent') === team.name,
                                }))]}
                                placeholder="Select a parent"
                            />
                        ))
                        .otherwise(() => (
                            <span className="flex items-center text-sm text-red-600">
                                Error loading parents, please refresh the page
                            </span>
                        ))}
                    <ErrorDisplay name="parent" errors={errors} />
                </InputGroup>
            </div>
        </div>
    )
}
