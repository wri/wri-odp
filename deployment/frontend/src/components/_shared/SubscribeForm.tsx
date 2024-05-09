import React from 'react'
import { EnvelopeIcon } from '@heroicons/react/20/solid'
import { Button, LoaderButton } from './Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ErrorDisplay } from './InputGroup'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
export function SubscribeForm() {
    const {
        formState: { errors },
        handleSubmit,
        watch,
        register,
    } = useForm<{ email: string }>({
        resolver: zodResolver(
            z.object({
                email: z.string().email(),
            })
        ),
    })
    const submitNewsletter = useMutation({
        mutationFn: async (data: { email: string }) => {
            console.log(data)
            const res = await fetch('https://reqres.in/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'morpheus',
                    job: 'leader',
                }),
            })
            const subscribe = await res.json()
            return subscribe
        },
    })
    return (
        <form
            onSubmit={handleSubmit(async (data) => {
                submitNewsletter.mutate(data, {
                    onSuccess: () => {
                        toast(
                            "You'll receive an email confirming your subscription",
                            { type: 'success' }
                        )
                    },
                    onError: (err) => {
                        console.error(err)

                        toast('Failed to subscribe to newsletter', {
                            type: 'error',
                        })
                    },
                })
            })}
            className="flex w-full flex-col gap-x-2 gap-y-4 lg:flex-row justify-between"
        >
            <div className="relative grow">
                <input
                    type="text"
                    {...register('email')}
                    aria-label="email"
                    className="h-11 w-full peer grow rounded border-0 shadow outline-0 ring-0 ring-offset-0 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 "
                />
                {!watch('email') || watch('email') === '' ? (
                    <div className="absolute pointer-events-none peer-focus:hidden inset-y-0 left-0 flex gap-x-2 items-center pl-3">
                        <EnvelopeIcon className="h-6 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                            Enter your email
                        </span>
                    </div>
                ) : (
                    <></>
                )}
                <ErrorDisplay errors={errors} name="email" />
            </div>
            <LoaderButton loading={submitNewsletter.isLoading}>
                SUBSCRIBE
            </LoaderButton>
        </form>
    )
}
