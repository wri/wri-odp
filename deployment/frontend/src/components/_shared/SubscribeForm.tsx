import React from 'react'
import { EnvelopeIcon } from '@heroicons/react/20/solid'
import { Button, LoaderButton } from './Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ErrorDisplay } from './InputGroup'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import qs from 'query-string'

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
    return (
        <form
            method="POST"
            action="https://ortto.wri.org/custom-forms/"
            className="flex w-full flex-col gap-x-2 gap-y-4 lg:flex-row justify-between"
        >
            <div className="relative grow">
                <input
                    type="email"
                    name="email"
                    aria-label="email"
                    className="h-11 w-full peer grow rounded border-0 shadow outline-0 ring-0 ring-offset-0 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 "
                />
                <input
                    type="hidden"
                    name="website"
                    value="http://datasets.wri.org "
                />
                <input
                    type="hidden"
                    name="form-name"
                    value="Footer Sign-up Form"
                />
                <input
                    type="hidden"
                    name="list"
                    value="DATA - Data Explorer - NEWSL - LIST"
                />
            </div>
            <Button>SUBSCRIBE</Button>
        </form>
    )
}
