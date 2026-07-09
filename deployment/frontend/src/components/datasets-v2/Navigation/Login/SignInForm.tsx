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

    const error = errorMessage || errors.username?.message || errors.password?.message;

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
            <div>
                <h3 className="mb-4 text-[1.75rem] font-semibold">Log In</h3>
                <InlineMessage
                    icon={<InformationCircleIcon width={40} height={40} />}
                    variant="info-white"
                    label=" Registration Not Available Yet! Login for WRI Members Only. You Can Still Use All Portal Features."
                />
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
                        label="Username or Email"
                        size="default"
                        noMarginBottom
                        errorMessage={errors.username?.message}
                        {...register('username')}
                        required
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
                            required
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
                        className="mt-4"
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
            <div className="mt-5 flex items-center justify-center gap-x-2 text-center">
                <div className="h-0 w-20 border border-1 border-wri-gray font-light text-[0.875rem]" />
                <div className="text-wri-black ">or continue with </div>
                <div className="h-0 w-20 border border-1 border-wri-gray font-light text-[0.875rem]" />
            </div>
            <div className="flex w-full flex-col justify-center">
                <Button
                    type="button"
                    className="mt-5 w-full justify-center"
                    onClick={handleAzureSignIn}
                    disabled={isLoadingAzure}
                    variant="outline"
                    size="default"
                    loading={isLoadingAzure}
                >
                    <div className="relative  h-4 w-4">
                        <Image src="/images/wri_logo.png" alt="WRI Logo" fill />
                    </div>
                    <div className="ml-2 w-fit text-base font-semibold text-wri-black ">
                        Sign In with your WRI Credentials
                    </div>
                </Button>

                <Button
                    className="mt-4"
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
            </div>
        </>
    );
}
