/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ResetPasswordSchema,
    type ResetPasswordFormType,
} from '@/schema/auth.schema'
import type { GetServerSideProps } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { useState } from 'react'
import { getServerAuthSession } from '@/server/auth'
import Spinner from '@/components/_shared/Spinner'
import { match } from 'ts-pattern'
import { ErrorMessage } from '@hookform/error-message'
import ky from 'ky'
import { env } from '@/env.mjs'
import type { CkanResponse } from '@/schema/ckan.schema'
import type { User } from '@portaljs/ckan'
import { NextSeo } from 'next-seo'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)

    if (session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
    const csrfToken = await getCsrfToken(context)
    if (!context.query.user_id || !context.query.token) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            csrfToken: csrfToken ? csrfToken : '',
            user: {
                id: context.query.user_id,
                reset_key: context.query.token,
            },
        },
    }
}

export default function ResetUserPage({
    csrfToken,
    user,
}: {
    csrfToken: string
    user: { id: string; reset_key: string }
}) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormType & { confirm: string }>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            ...user,
        },
    })

    const resetPassword = api.auth.resetPassword.useMutation({
        onSuccess: async () => {
            await signIn('credentials', {
                callbackUrl: '/dashboard/datasets',
                username: watch('id'),
                password: watch('password'),
            })
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const error =
        errorMessage ??
        errors.password?.message ??
        errors.confirm_password?.message ??
        errors.confirm?.message

    return (
        <>
            <NextSeo title="Reset your password" />
            <div className="flex items-center justify-center w-full min-h-screen">
                <form
                    className="flex flex-col gap-y-4 max-w-2xl w-full px-5"
                    onSubmit={handleSubmit((data) => {
                        resetPassword.mutate(data)
                    })}
                >
                    <input
                        name="csrfToken"
                        type="hidden"
                        defaultValue={csrfToken}
                    />
                  <div className='flex justify-center w-full mb-10'>
                    <div className="relative mx-auto h-12 w-44 sm:h-20 sm:w-56">
                        <Image
                            src="/images/WRI_logo_4c.png"
                            alt="Picture of the author"
                            fill
                        />
                    </div>
                    </div>
                    <h3 className="font-semibold text-[1.75rem] text-center">
                        Reset your password
                    </h3>
                    <div className=" rounded-md px-4 group py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200">
                        <div className="grow shrink basis-auto">
                            <input
                                type="password"
                                placeholder="Password"
                                className=" focus:outline-none  placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full !border-none"
                                {...register('password')}
                            />
                        </div>
                        <div className=" my-auto">
                            <LockClosedIcon className="w-4 h-4 text-[#3654A5]" />
                        </div>
                    </div>

                    <div className=" rounded-md px-4 group py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200">
                        <div className="grow shrink basis-auto">
                            <input
                                type="password"
                                placeholder="Confirm password"
                                className=" focus:outline-none placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full !border-none"
                                {...register('confirm_password')}
                            />
                        </div>
                        <div className=" my-auto">
                            <LockClosedIcon className="w-4 h-4 text-[#3654A5]" />
                        </div>
                    </div>
                    {error ? (
                        <ErrorAlert
                            text={error}
                            title="Password reset failed"
                        />
                    ) : null}
                    <button
                        disabled={resetPassword.isLoading}
                        type="submit"
                        className="bg-wri-gold text-wri-black font-semibold text-[1.125rem] rounded-sm px-4 py-4"
                    >
                        {resetPassword.isLoading
                            ? 'Updating password...'
                            : 'Reset password'}
                    </button>
                </form>
            </div>
        </>
    )
}
