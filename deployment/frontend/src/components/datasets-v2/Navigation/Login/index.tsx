import { useState } from 'react';
import SignInForm from './SignInForm';
import ResetPasswordForm from './ResetPasswordForm';

export default function Login({
    onSignIn = () => {},
}: {
    onSignIn?: () => void;
}) {
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    return (
        <section id="login-modal" className="font-acumin mb-4">
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
    );
}