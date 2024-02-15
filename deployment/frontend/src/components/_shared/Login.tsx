import React, {
    Dispatch,
    FormEvent,
    SetStateAction,
    useEffect,
    useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import {
    ExclamationCircleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import {
    RequestResetPasswordFormType,
    RequestResetPasswordSchema,
    SignInFormType,
    SignInSchema,
} from '@/schema/auth.schema'
import { ErrorAlert } from './Alerts'
import { api } from '@/utils/api'
import notify from '@/utils/notify'

export default function Login({
    onSignIn = () => {},
}: {
    onSignIn?: () => void
}) {
    const [isPasswordReset, setIsPasswordReset] = useState(false)

    return (
        <section id="login-modal" className=" font-acumin mb-4">
            <div className="mt-2 flex flex-col">
                {!isPasswordReset ? (
                    <SignInForm
                        onSignIn={onSignIn}
                        setIsPasswordReset={setIsPasswordReset}
                    />
                ) : (
                    <ResetPasswordForm
                        setIsPasswordReset={setIsPasswordReset}
                    />
                )}
            </div>
        </section>
    )
}

function SignInForm({
    onSignIn,
    setIsPasswordReset,
}: {
    onSignIn: () => void
    setIsPasswordReset: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingAzure, setIsLoadingAzure] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignInFormType & { confirm: string }>({
        resolver: zodResolver(SignInSchema),
    })

    const error =
        errorMessage || errors.username?.message || errors.password?.message

    const handleAzureSignIn = async () => {
        setIsLoadingAzure(true)
        try {
            await signIn('azure-ad', {
                callbackUrl: '/dashboard',
                redirect: false,
            })
        } catch (error) {
            console.error('Azure AD Sign-in error:', error)
            setErrorMessage('Azure AD Sign-in failed')
        }
        setIsLoadingAzure(false)
    }

    return (
        <>
            <div className=" text-center">
                <InformationCircleIcon className="w-5 h-5 mx-auto mb-2" />
                <p className=" font-light font-wri-black text-[0.813rem]">
                    Registration Not Available Yet!{' '}
                    <b>Login for WRI Members Only.</b> You Can Still Use All
                    Portal Features.
                </p>
                <h3 className="mt-8 font-semibold text-[1.75rem]">Log In</h3>
            </div>
            <div className="mt-4">
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={(data) => {
                        setErrorMessage('')
                        handleSubmit(async (data) => {
                            setIsLoading(true)
                            const signInStatus = await signIn('credentials', {
                                callbackUrl: '/dashboard',
                                redirect: false,
                                ...data,
                            })

                            setIsLoading(false)
                            if (signInStatus?.error) {
                                // TODO: we should get the error from the response
                                console.log(signInStatus)
                                setErrorMessage(signInStatus.error)
                            } else {
                                notify('Sign in successful')
                                onSignIn ? onSignIn() : router.reload()
                                router.push("/dashboard")
                            }
                        })(data)
                    }}
                >
                    <div className=" rounded-md px-4 group py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200">
                        <div className="grow shrink basis-auto">
                            <input
                                type="text"
                                placeholder="Username or Email"
                                className=" focus:outline-none  placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full !border-none"
                                {...register('username')}
                            />
                        </div>
                        <div className=" my-auto">
                            <UserIcon className="w-4 h-4 text-[#3654A5]" />
                        </div>
                    </div>

                    <div className=" rounded-md px-4 group py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200">
                        <div className="grow shrink basis-auto">
                            <input
                                type="password"
                                placeholder="Password"
                                className=" focus:outline-none placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full !border-none"
                                {...register('password')}
                            />
                        </div>
                        <div className=" my-auto">
                            <LockClosedIcon className="w-4 h-4 text-[#3654A5]" />
                        </div>
                    </div>
                    {error ? (
                        <ErrorAlert text={error} title="Sign in failed" />
                    ) : null}
                    <button
                        className="font-light text-[0.875rem] text-wri-black text-right -mt-2"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            setIsPasswordReset(true)
                            return false
                        }}
                        id="forgot-password-button"
                    >
                        Forgot password?
                    </button>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="bg-wri-gold text-wri-black font-semibold text-[1.125rem] rounded-sm px-4 py-4"
                        id="login-button"
                    >
                        {isLoading ? 'Signing in...' : 'Log In'}
                    </button>
                </form>
            </div>
            <div className="mt-8 text-center flex justify-center items-center gap-x-2">
                <div className="font-light text-[0.875rem] border border-1 border-wri-gray w-20 h-0" />
                <div className="text-wri-black ">or</div>
                <div className="font-light text-[0.875rem] border border-1 border-wri-gray w-20 h-0" />
            </div>
            <button
                type="button"
                className="flex  mt-8 outline outline-1 outline-wri-gold rounded-sm justify-center py-4 cursor-pointer"
                onClick={handleAzureSignIn}
                disabled={isLoadingAzure}
            >
                <div className="w-4 h-4 relative my-auto">
                    <Image src="/images/wri_logo.png" alt="WRI Logo" fill />
                </div>
                <div className="ml-2 w-fit font-semibold text-base text-wri-black ">
                    {!isLoadingAzure ? "Sign In with your WRI Credentials" : "Signing in..."}
                </div>
            </button>
        </>
    )
}

function ResetPasswordForm({
    setIsPasswordReset,
}: {
    setIsPasswordReset: Dispatch<SetStateAction<boolean>>
}) {
    const [errorMessage, setErrorMessage] = useState('')
    const [result, setResult] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RequestResetPasswordFormType>({
        resolver: zodResolver(RequestResetPasswordSchema),
    })

    const requestPasswordReset = api.auth.requestPasswordReset.useMutation({
        onSuccess: (data) => {
            setResult(data.result)
        },
        onError: (e) => {
            setErrorMessage(e.message)
        },
    })

    const error = errorMessage || errors.email?.message

    return (
        <>
            <div className=" text-center">
                <h3 className="mt-8 font-semibold text-[1.75rem]">
                    Password Reset
                </h3>
            </div>
            <div className="mt-4">
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={(data) => {
                        setErrorMessage('')
                        setResult('')
                        handleSubmit(async (data) => {
                            requestPasswordReset.mutate(data)
                        })(data)
                    }}
                >
                    <div className=" rounded-md px-4 group py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200">
                        <div className="grow shrink basis-auto">
                            <input
                                type="text"
                                placeholder="Email"
                                className=" focus:outline-none  placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full !border-none"
                                {...register('email')}
                            />
                        </div>
                        <div className=" my-auto">
                            <EnvelopeIcon className="w-4 h-4 text-[#3654A5]" />
                        </div>
                    </div>

                    <button
                        className="font-light text-[0.875rem] text-wri-black text-right -mt-2"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            setIsPasswordReset(false)
                            return false
                        }}
                    >
                        Go back to sign in
                    </button>

                    {result ? (
                        <p className="text-center text-green-600">{result}</p>
                    ) : null}

                    {error ? (
                        <ErrorAlert
                            text={error}
                            title="Password reset failed"
                        />
                    ) : null}
                    <button
                        disabled={requestPasswordReset.isLoading}
                        type="submit"
                        className="bg-wri-gold text-wri-black font-semibold text-[1.125rem] rounded-sm px-4 py-4"
                        id="request-reset-button"
                    >
                        {requestPasswordReset.isLoading
                            ? 'Resetting password...'
                            : 'Send password reset link'}
                    </button>
                </form>
            </div>
        </>
    )
}
