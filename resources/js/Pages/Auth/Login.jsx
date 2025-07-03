import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// --- Icon Component (from Welcome page for consistency) ---
const FuelIcon = ({ className = '' }) => (
    <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="currentColor"/>
    </svg>
);

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <>
            <Head title="Log in - CreatorFuel" />
            <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col justify-center items-center p-4">
                
                {/* Logo */}
                <div className="mb-8">
                    <Link href="/" className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
                        <FuelIcon className="w-8 h-8 text-green-600" />
                        <span className="font-bold text-2xl">CreatorFuel</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-medium text-green-600 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {status && (
                        <div className="font-medium text-sm text-green-700 bg-green-100 p-3 rounded-md">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-green-600 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={processing}
                            >
                                {processing ? 'Logging in...' : 'Log in'}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="mt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} CreatorFuel. All rights reserved.
                </p>
            </div>
        </>
    );
}