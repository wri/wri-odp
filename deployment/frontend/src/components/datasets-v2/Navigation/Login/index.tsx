import { useState } from 'react';
import SignInForm from './SignInForm';
import ResetPasswordForm from './ResetPasswordForm';

export default function Login({ onSignIn = () => {} }: { onSignIn?: () => void }) {
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    return (
        <section id="login-modal" className="p-6">
            {!isPasswordReset ? (
                <SignInForm onSignIn={onSignIn} setIsPasswordReset={setIsPasswordReset} />
            ) : (
                <ResetPasswordForm setIsPasswordReset={setIsPasswordReset} />
            )}
        </section>
    );
}
