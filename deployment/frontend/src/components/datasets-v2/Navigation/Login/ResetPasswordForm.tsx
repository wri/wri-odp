import React, { type Dispatch, type SetStateAction, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { InlineMessage } from '@worldresources/wri-design-systems';
import {
    type RequestResetPasswordFormType,
    RequestResetPasswordSchema,
} from '@/schema/auth.schema';
import { api } from '@/utils/api';

type Props = {
    setIsPasswordReset: Dispatch<SetStateAction<boolean>>;
};

export default function ResetPasswordForm({ setIsPasswordReset }: Props) {
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RequestResetPasswordFormType>({
        resolver: zodResolver(RequestResetPasswordSchema),
    });

    const requestPasswordReset = api.auth.requestPasswordReset.useMutation({
        onSuccess: (data) => {
            setResult(data.result);
        },
        onError: (e) => {
            setErrorMessage(e.message);
        },
    });

    const error = errorMessage || errors.email?.message;

    return (
        <>
            <div className="text-center">
                <h3 className="mt-8 text-[1.75rem] font-semibold">
                    Password Reset
                </h3>
            </div>
            <div className="mt-4">
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={(event) => {
                        setErrorMessage('');
                        setResult('');
                        handleSubmit(async (data) => {
                            requestPasswordReset.mutate(data);
                        })(event);
                    }}
                >
                    <div className="group flex min-w-fit w-full flex-row items-center gap-x-2 rounded-md border-[1px] border-wri-gray-200 bg-white px-4 py-3 pr-8">
                        <div className="grow shrink basis-auto">
                            <input
                                type="text"
                                placeholder="Email"
                                id="reset-link-email"
                                className="w-full border-none text-xs font-light placeholder:text-xs placeholder:font-light placeholder:text-[#353535] focus:outline-none"
                                {...register('email')}
                            />
                        </div>
                        <div className="my-auto">
                            <EnvelopeIcon className="h-4 w-4 text-[#3654A5]" />
                        </div>
                    </div>

                    <button
                        className="-mt-2 text-right text-[0.875rem] font-light text-wri-black"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsPasswordReset(false);
                            return false;
                        }}
                    >
                        Go back to sign in
                    </button>

                    {result ? (
                        <p className="text-center text-green-600">{result}</p>
                    ) : null}

                    {error ? (
                        <InlineMessage
                            size="full-width"
                            variant="warning"
                            label="Password reset failed"
                            caption={error}
                        />
                    ) : null}
                    <button
                        disabled={requestPasswordReset.isLoading}
                        type="submit"
                        className="rounded-sm bg-wri-gold px-4 py-4 text-[1.125rem] font-semibold text-wri-black"
                        id="request-reset-button"
                    >
                        {requestPasswordReset.isLoading
                            ? 'Resetting password...'
                            : 'Send password reset link'}
                    </button>
                </form>
            </div>
        </>
    );
}