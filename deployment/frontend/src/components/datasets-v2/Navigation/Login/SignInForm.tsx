import React, { type Dispatch, type SetStateAction, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Button, InlineMessage, Password, TextInput } from '@worldresources/wri-design-systems';
import { type SignInFormType, SignInSchema } from '@/schema/auth.schema';
import notify from '@/utils/notify';

type Props = {
    onSignIn: () => void;
    setIsPasswordReset: Dispatch<SetStateAction<boolean>>;
};

export default function SignInForm({ onSignIn, setIsPasswordReset }: Props) {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAzure, setIsLoadingAzure] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SignInFormType & { confirm: string }>({
        resolver: zodResolver(SignInSchema),
    });

    const [password, setPassword] = useState('');

    const error =
        errorMessage ?? errors.username?.message ?? errors.password?.message;

    const handleAzureSignIn = async () => {
        setIsLoadingAzure(true);
        try {
            await signIn('azure-ad', {
                callbackUrl: '/dashboard',
                redirect: false,
            });
        } catch (error) {
            console.error('Azure AD Sign-in error:', error);
            setErrorMessage('Azure AD Sign-in failed');
        }
        setIsLoadingAzure(false);
    };

    return (
        <>
            <div className="text-center">
                <InformationCircleIcon className="mx-auto mb-2 h-5 w-5" />
                <p className="font-light font-wri-black text-[0.813rem]">
                    Registration Not Available Yet!{' '}
                    <b>Login for WRI Members Only.</b> You Can Still Use All
                    Portal Features.
                </p>
                <h3 className="mt-8 text-[1.75rem] font-semibold">Log In</h3>
            </div>
            <div className="mt-4">
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={(event) => {
                        setErrorMessage('');
                        void handleSubmit(async (data) => {
                            setIsLoading(true);
                            const signInStatus = await signIn('credentials', {
                                callbackUrl: '/dashboard',
                                redirect: false,
                                ...data,
                                password,
                            });

                            setIsLoading(false);
                            if (signInStatus?.error) {
                                setErrorMessage(signInStatus.error);
                            } else {
                                notify('Sign in successful');
                                if (onSignIn) {
                                    onSignIn();
                                } else {
                                    router.reload();
                                }
                                void router.push('/dashboard');
                            }
                        })(event);
                    }}
                >
                    <TextInput
                        placeholder="Username or Email"
                        size="default"
                        noMarginBottom
                        errorMessage={errors.username?.message}
                        {...register('username')}
                    />
                    <div className="w-full">
                        <Password
                            label="Password"
                            caption=""
                            hideValidations
                            minLength={0}
                            onChange={({ password: nextPassword }) => {
                                setPassword(nextPassword);
                                setValue('password', nextPassword, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                });
                            }}
                        />
                    </div>
                    {error ? (
                        <InlineMessage
                            size="full-width"
                            variant="warning"
                            label="Sign in failed"
                            caption={error}
                        />
                    ) : null}
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsPasswordReset(true);
                            return false;
                        }}
                        id="forgot-password-button"
                        variant="borderless"
                        size="small"
                    >
                        Forgot password?
                    </Button>
                    <Button
                        disabled={isLoading}
                        type="submit"
                        id="login-button"
                        loading={isLoading}
                        variant="primary"
                        size="default"
                    >
                        Log In
                    </Button>
                </form>
            </div>
            <div className="mt-8 flex items-center justify-center gap-x-2 text-center">
                <div className="h-0 w-20 border border-1 border-wri-gray font-light text-[0.875rem]" />
                <div className="text-wri-black ">or</div>
                <div className="h-0 w-20 border border-1 border-wri-gray font-light text-[0.875rem]" />
            </div>
            <Button
                type="button"
                className="mt-8"
                onClick={handleAzureSignIn}
                disabled={isLoadingAzure}
                variant="outline"
                size="default"
                loading={isLoadingAzure}
            >
                <div className="relative my-auto h-4 w-4">
                    <Image src="/images/wri_logo.png" alt="WRI Logo" fill />
                </div>
                <div className="ml-2 w-fit text-base font-semibold text-wri-black ">
                    Sign In with your WRI Credentials
                </div>
            </Button>
        </>
    );
}