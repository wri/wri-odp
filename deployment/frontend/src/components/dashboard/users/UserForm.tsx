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
import { UserFormSchema } from '@/schema/user.schema'
import type { UserFormInput, UserSchema } from '@/schema/user.schema'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
});
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'

export default function UserForm({ user }: { user: User }) {
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [upload, setUpload] = useState({ url: false, file: false })
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const utils = api.useUtils()
    const form = useForm<UserFormInput>({
        defaultValues: {
            id: user.id!,
            name: user.name,
            email: user.email,
            fullname: user.fullname ?? '',
            oldpassword: null,
            password: null,
            confirm: null,
            image_url: user.image_url ?? user.image_display_url ?? undefined,
        },
        resolver: zodResolver(UserFormSchema),
        mode: 'onSubmit',
    })
    const { register, handleSubmit, formState, watch, setError, setValue } =
        form
    const { errors } = formState
    const userUpdateApi = api.user.updateUser.useMutation({
        onSuccess: async (data) => {
            await utils.user.getUser.invalidate(user.name)
            notify(`Successfully updated user: ${data.name}`, 'success')
            router.push('/dashboard/users')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const deleteUser = api.user.deleteUser.useMutation({
        onSuccess: async (data) => {
            await utils.user.getUser.invalidate(user.name)
            await utils.user.getAllUsers.invalidate({
                search: '',
                page: { start: 0, rows: 100 },
            })
            notify(`Successfully deleted user: ${user.name}`, 'error')
            router.push('/dashboard/users')
        },
    })

    const onSubmit = (data: UserFormInput) => {
        if (!isDeleting) {
            if (data.password !== data.confirm) {
                setError('confirm', {
                    type: 'manual',
                    message: 'Password does not match',
                })
                return
            }

            if (data.oldpassword == null && data.password !== null) {
                setError('oldpassword', {
                    type: 'manual',
                    message: 'Old password is required',
                })
                return
            }

            const payload: UserFormInput = {
                id: user.id!,
                name: data.name,
                email: data.email,
                fullname: data.fullname ? data.fullname : '',
                image_url: data.image_url ? data.image_url : '',
            }
            if (data.password !== null) {
                payload.password = data.password
            }

            userUpdateApi.mutate(payload)
        }
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-8xl mx-auto w-full xl:w-[90%] py-12 px-4 sm:px-6 lg:px-12  rounded-lg shadow-wri flex flex-col gap-y-8"
            >
                <InputGroup label="Username" labelClassName="sm:max-w-[10rem]">
                    <Input {...register('name')} type="text" disabled aria-label='user name'/>
                </InputGroup>
                <InputGroup label="Full name" labelClassName="sm:max-w-[10rem]">
                    <Input
                        {...register('fullname')}
                        placeholder="Full Name"
                        name="fullname"
                        type="text"
                        aria-label='full name'
                    />
                    <ErrorDisplay name="fullname" errors={errors} />
                </InputGroup>
                <InputGroup
                    label="Email"
                    labelClassName="sm:max-w-[10rem]"
                    required
                >
                    <Input
                        {...register('email')}
                        placeholder="Email address"
                        type="email"
                        aria-label='email address'
                    />
                    <ErrorDisplay name="email" errors={errors} />
                </InputGroup>
                <InputGroup
                    label="Profile Picture"
                    labelClassName="sm:max-w-[10rem]"
                >
                    {upload.file === false && upload.url === false && (
                        <div className="flex gap-x-2.5">
                            <button
                                aria-label='upload image'
                                className="flex px-2.5 py-2 rounded-md text-black outline outline-1"
                                onClick={() =>
                                    setUpload({ url: false, file: true })
                                }
                            >
                                <CloudArrowUpIcon className="h-5 w-5" />
                                Upload
                            </button>
                            <button
                                aria-label='link image'
                                className="flex px-2.5 py-2  rounded-md text-black outline outline-1"
                                onClick={() =>
                                    setUpload({ url: true, file: false })
                                }
                            >
                                <GlobeAltIcon className="h-5 w-5" />
                                <span>Link</span>
                            </button>
                        </div>
                    )}
                    {upload.file && (
                        <div className="flex gap-x-2.5">
                            <ImageUploader
                                clearImage={() => setValue('image_url', '')}
                                defaultImage={watch('image_url')}
                                onUploadSuccess={(response: UploadResult) => {
                                    const url =
                                        response.successful[0]?.uploadURL ??
                                        null
                                    const name = url ? url.split('/').pop() : ''
                                    setValue(
                                        'image_url',
                                        `ckanuploadimage:${name}`
                                    )
                                }}
                            />
                            <button
                                aria-label='upload file'
                                className="flex rounded-md text-black"
                                onClick={() =>
                                    setUpload({ url: false, file: false })
                                }
                            >
                                <MinusCircleIcon className="h-5 w-5 text-red-600" />
                            </button>
                        </div>
                    )}
                    {upload.url && (
                        <div className="flex gap-x-2.5">
                            <Input {...register('image_url')} type="text"  aria-label='upload url'/>
                            <button
                                aria-label='upload url'
                                className="flex rounded-md text-black"
                                onClick={() =>
                                    setUpload({ url: false, file: false })
                                }
                            >
                                <MinusCircleIcon className="h-5 w-5 text-red-600" />
                            </button>
                        </div>
                    )}
                </InputGroup>
                <InputGroup
                    label="Old Password"
                    labelClassName="sm:max-w-[10rem]"
                >
                    <Input {...register('oldpassword')} type="password"  aria-label='old password'/>
                    <ErrorDisplay name="oldpassword" errors={errors} />
                </InputGroup>
                <InputGroup label="Password" labelClassName="sm:max-w-[10rem]">
                    <Input {...register('password')} type="password" aria-label='password'/>
                    <ErrorDisplay name="password" errors={errors} />
                </InputGroup>
                <InputGroup
                    label="Confirm Password"
                    labelClassName="sm:max-w-[10rem]"
                >
                    <Input {...register('confirm')} type="password" aria-label='confirm password'/>
                    <ErrorDisplay name="confirm" errors={errors} />
                </InputGroup>

                <div className="flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] gap-x-4 justify-end font-acumin text-2xl font-semibold text-black px-4  sm:px-6 xxl:px-0">
                    <Button
                        aria-label='delete user'
                        variant="destructive"
                        onClick={() => {
                            setIsDeleting(true)
                            setOpen(true)
                        }}
                        id={user.name}
                    >
                        Delete
                    </Button>
                    <LoaderButton
                        aria-label='update user'
                        loading={userUpdateApi.isLoading}
                        type="submit"
                    >
                        Update Profile
                    </LoaderButton>
                </div>
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
            </form>
            <Modal
                open={open}
                setOpen={setOpen}
                className="sm:w-full sm:max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                        >
                            Delete User
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this user?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        loading={deleteUser.isLoading}
                        onClick={() => {
                            setIsDeleting(true)
                            deleteUser.mutate(user.id!)
                        }}
                        id={user.name}
                    >
                        Delete User
                    </LoaderButton>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}
