'use client';

import { useActionState } from 'react';
import { authenticate } from '@/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
    // useActionState takes the server action and an initial state (undefined)
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
            <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">QuickTrails</h1>
                    <p className="text-sm text-gray-500">Sign in to the Agent Workspace</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="agent@quicktrails.com"
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded text-center">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition shadow-sm disabled:opacity-70 flex justify-center items-center"
                    >
                        {isPending ? (
                            <span className="animate-pulse">Signing in...</span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link href="/" className="hover:text-amber-600 transition">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}