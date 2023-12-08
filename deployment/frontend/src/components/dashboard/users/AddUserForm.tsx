import React, { useState } from 'react'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, LoaderButton } from '@/components/_shared/Button'
import Link from 'next/link'
import { api } from '@/utils/api'
import { User } from '@portaljs/ckan'
import { ImageUploader } from '../_shared/ImageUploader'
import {
    GlobeAltIcon,
    CloudArrowUpIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline'
import { UploadResult } from '@uppy/core'
import { UserFormInviteSchema } from '@/schema/user.schema'
import type { UserFormInviteInput } from '@/schema/user.schema'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'
import Modal from '@/components/_shared/Modal'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { WriOrganization } from '@/schema/ckan.schema'
import SimpleSelect from '@/components/_shared/SimpleSelect'

export default function AddUserForm({
    orgList,
}: {
    orgList: WriOrganization[]
}) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const utils = api.useUtils()
    const form = useForm<UserFormInviteInput>({
        defaultValues: {
            email: '',
            team: {
                value: '',
                label: '',
                id: '',
            },
            role: {
                label: 'Member',
                value: 'member',
                id: 'member',
            },
        },
        resolver: zodResolver(UserFormInviteSchema),
        mode: 'onSubmit',
    })
    const { register, handleSubmit, formState, setError, watch } = form
    const { errors } = formState
    const userCreateApi = api.user.createOtherUser.useMutation({
        onSuccess: async (data) => {
            notify(`Successfully created user: ${data.name}`, 'success')
            router.push('/dashboard/users')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const onSubmit = (data: UserFormInviteInput) => {
        const payload: UserFormInviteInput = {
            email: data.email,
            team: data.team,
            role: data.role,
        }

        userCreateApi.mutate(payload)
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-8xl mx-auto w-full xl:w-[90%] py-12 px-4 sm:px-6 lg:px-12  rounded-lg shadow-wri flex flex-col gap-y-8"
            >
                <InputGroup
                    label="Email"
                    labelClassName="sm:max-w-[10rem]"
                    required
                >
                    <Input
                        {...register('email')}
                        placeholder="Email address"
                        type="email"
                    />
                    <ErrorDisplay name="email" errors={errors} />
                </InputGroup>
                <InputGroup label="Teams" labelClassName="sm:max-w-[10rem]">
                    <SimpleSelect
                        formObj={form}
                        name="team"
                        id="orgId"
                        options={[
                            {
                                label: 'No team',
                                value: '',
                                id: '',
                            },
                            ...orgList.map((team) => ({
                                label: team.title ?? team.name,
                                value: team.name,
                                id: team.id,
                            })),
                        ]}
                        placeholder="Select a team"
                    />
                </InputGroup>
                {watch('team')?.label && watch('team')?.label !== 'No team' && (
                    <InputGroup label="Role" labelClassName="sm:max-w-[10rem]">
                        <SimpleSelect
                            formObj={form}
                            name="role"
                            id="role"
                            options={[
                                {
                                    label: 'Member',
                                    value: 'member',
                                    id: 'member',
                                },
                                {
                                    label: 'Admin',
                                    value: 'admin',
                                    id: 'admin',
                                },
                                {
                                    label: 'Editor',
                                    value: 'Editor',
                                    id: 'editor',
                                },
                            ]}
                            placeholder="Select a role"
                        />
                    </InputGroup>
                )}

                <div className="flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] gap-x-4 justify-end font-acumin text-2xl font-semibold text-black px-4  sm:px-6 xxl:px-0">
                    <LoaderButton
                        loading={userCreateApi.isLoading}
                        type="submit"
                    >
                        Add User
                    </LoaderButton>
                </div>
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
            </form>
        </>
    )
}
