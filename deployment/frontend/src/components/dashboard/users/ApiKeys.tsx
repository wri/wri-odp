import { ErrorAlert, InfoAlert } from '@/components/_shared/Alerts'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
import Modal from '@/components/_shared/Modal'
import { ApiToken } from '@/interfaces/user.interface'
import { api } from '@/utils/api'
import classNames from '@/utils/classnames'
import notify from '@/utils/notify'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

const compareTokens = (tokenA: ApiToken, tokenB: ApiToken) => {
    const time1 = new Date(tokenB.created_at)
    const time2 = new Date(tokenA.created_at)

    // Compare the timestamps
    if (time1 < time2) {
        return -1
    } else if (time1 > time2) {
        return 1
    } else {
        return 0
    }
}

function TokenCard({ token }: { token: ApiToken }) {
    const created_at = new Date(token.created_at ?? '')
    const last_access = new Date(token.last_access ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    const utils = api.useUtils()
    const deleteToken = api.user.deleteApiToken.useMutation({
        onSuccess: async (data) => {
            await utils.user.getUserApiTokens.invalidate()
            notify(`Successfully deleted the ${token.name} token`, 'error')
        },
    })
    const [open, setOpen] = useState(false)
    return (
        <>
            <div className="flex flex-col">
                <div className="flex gap-x-1">
                    <p className="font-semibold">Name: </p>
                    <p className="font-normal text-base">{token.name}</p>
                </div>
                <div className="flex gap-x-1">
                    <p className="font-semibold">Created at: </p>
                    <p className="font-normal text-base">
                        {created_at.toLocaleDateString('en-US', options)}
                    </p>
                </div>
                {token.last_access && (
                    <div className="flex gap-x-1">
                        <p className="font-semibold">Last access: </p>
                        <p className="font-normal text-base">
                            {last_access.toLocaleDateString('en-US', options)}
                        </p>
                    </div>
                )}
            </div>
            <Button
                aria-label='delete token'
                variant="destructive"
                size="sm"
                className="rounded-full px-1.5 delete-token"
                onClick={() => setOpen(true)}
            >
                <TrashIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </Button>
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
                            Delete API Token
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this API Token?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        loading={deleteToken.isLoading}
                        onClick={() => deleteToken.mutate({ jti: token.id })}
                    >
                        Delete Token
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

export function ApiKeys({ apiTokens }: { apiTokens: ApiToken[] }) {
    const utils = api.useUtils()
    const { data: session } = useSession()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<{ name: string; user: string }>({
        defaultValues: {
            user: session?.user?.name ?? '',
        },
    })
    const createToken = api.user.createApiToken.useMutation({
        onSuccess: async (data) => {
            reset()
            setOpen(false)
            await utils.user.getUserApiTokens.invalidate()
            setToken(data.token)
            notify(`Successfully created the ${watch('name')} token`, 'success')
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })
    return (
        <>
            <div className="max-w-8xl mx-auto w-full xl:w-[90%] py-12 rounded-lg shadow-wri flex flex-col">
                <div className="flex justify-between items-center px-4 pb-4">
                    <h3 className="text-xl leading-6 text-gray-900">
                        {apiTokens.length} API Tokens
                    </h3>
                    <Button size="sm" onClick={() => setOpen(true)}>
                        Create API Token
                    </Button>
                </div>
                {token && (
                    <div className="p-4">
                        <InfoAlert
                            title="Make sure to copy it now, you won't be able to see it again!"
                            text={token}
                            copy={true}
              close={true}
                        />
                    </div>
                )}
                {apiTokens.sort(compareTokens).map((token, index) => (
                    <div
                        className={classNames(
                            'flex flex-row items-center justify-between gap-x-4 hover:bg-slate-100  rounded-md p-4',
                            index % 2 === 0
                                ? 'bg-wri-row-gray hover:bg-wri-slate'
                                : ''
                        )}
                    >
                        <TokenCard key={token.id} token={token} />
                    </div>
                ))}
            </div>
            <Modal
                open={open}
                setOpen={setOpen}
                className="sm:w-full sm:max-w-lg"
            >
                <div className="p-6">
                    <div className="border-b border-zinc-100 pb-5">
                        <div className="font-acumin text-3xl font-normal text-black">
                            Create a new API Token
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit((data) => {
                            createToken.mutate(data)
                        })}
                        className="flex flex-col sm:flex-row gap-5 pt-6"
                    >
                        <input
                            type="text"
                            id="name"
                            className="block w-full rounded-md border-b border-wri-green py-1.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                            placeholder="api_token"
                            {...register('name')}
                        />
                        <LoaderButton
                            className="whitespace-nowrap"
                            type="submit"
                            loading={createToken.isLoading}
                        >
                            Create Token
                        </LoaderButton>
                    </form>
                    {errorMessage && (
                        <div className="py-4">
                            <ErrorAlert text={errorMessage} />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    )
}
