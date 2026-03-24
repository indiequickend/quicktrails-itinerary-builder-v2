'use server'

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        // Explicitly extract the values from the form
        const email = formData.get('email');
        const password = formData.get('password');

        await signIn('credentials', {
            email,
            password,
            redirectTo: '/builder', // Force redirect here instead of relying on callbackUrl
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password. Please try again.';
                default:
                    return 'Something went wrong. Please contact support.';
            }
        }
        // Next.js uses errors to handle redirects. If it's NOT an AuthError, 
        // we must throw it so Next.js can successfully redirect the user to /builder.
        throw error;
    }
}