import React, { type Dispatch, type SetStateAction, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, InlineMessage, TextInput } from '@worldresources/wri-design-systems';
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
        setValue,
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

    const error = errorMessage ?? errors.email?.message;
    const emailField = register('email');

    return (
        <>
            <Button
                className="-mt-2 self-start"
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setIsPasswordReset(false);
                    return false;
                }}
                variant="borderless"
                size="small"
            >
                Go back to sign in
            </Button>
            <div className="text-center">
                <h3 className="mt-8 text-[1.75rem] font-semibold">Password Reset</h3>
            </div>
            <div className="mt-4">
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={(event) => {
                        setErrorMessage('');
                        setResult('');
                        void handleSubmit((data) => {
                            requestPasswordReset.mutate(data);
                        })(event);
                    }}
                >
                    <TextInput
                        label="Email"
                        id="reset-link-email"
                        type="email"
                        autoComplete="email"
                        size="default"
                        noMarginBottom
                        errorMessage={errors.email?.message}
                        {...emailField}
                        onChange={(event) => {
                            setValue('email', event.target.value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                            });
                        }}
                        required
                    />

                    {result ? (
                        <InlineMessage
                            size="full-width"
                            variant="success"
                            label={result}
                            caption=""
                        />
                    ) : null}

                    {error ? (
                        <InlineMessage
                            size="full-width"
                            variant="warning"
                            label="Password reset failed"
                            caption={error}
                        />
                    ) : null}
                    <Button
                        disabled={requestPasswordReset.isLoading}
                        type="submit"
                        className="mt-2"
                        id="request-reset-button"
                        loading={requestPasswordReset.isLoading}
                        variant="primary"
                        size="default"
                    >
                        Send password reset link
                    </Button>
                </form>
            </div>
        </>
    );
}
