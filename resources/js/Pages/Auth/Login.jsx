import { useEffect, useState } from 'react';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [role, setRole] = useState('admin');
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

    const handleRoleLogin = (r) => {
        // try to use Laravel's named route helper if available, fallback to hard path
        try {
            if (r === 'admin' && typeof route === 'function') {
                window.location.href = route('admin.dashboard');
                return;
            }
            if (r === 'tenant' && typeof route === 'function') {
                window.location.href = route('dashboard');
                return;
            }
        } catch (e) {
            // ignore and fallback
        }

        if (r === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">FlatEase</h1>
                            <p className="text-gray-600 mt-1">Welcome back to your property manager</p>
                        </div>
                    </div>

                    {/* Success Message */}
                    {status && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                            {status}
                        </div>
                    )}

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to your account</h2>
                                <p className="text-gray-600 text-sm">Access your apartment management dashboard</p>
                            </div>

                            {/* Role Tabs */}
                            <div className="flex rounded-md bg-gray-50 p-1 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'admin' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                                >
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('tenant')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'tenant' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                                >
                                    Tenant
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center pt-2">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                        Remember me
                                    </label>
                                </div>

                                {/* Single role-aware button */}
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleLogin(role)}
                                        disabled={processing}
                                        className={`w-full ${role === 'admin' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} disabled:bg-gray-400 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2`}
                                    >
                                        {role === 'admin' ? 'Sign in as Admin' : 'Sign in as Tenant'}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div className="space-y-2 text-center text-sm">
                                <Link
                                    href={route('register')}
                                    className="block text-blue-600 hover:text-blue-700 font-semibold transition"
                                >
                                    Create new account
                                </Link>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="block text-gray-600 hover:text-gray-900 transition"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="text-sm">
                            <p className="text-gray-900 font-semibold">500+</p>
                            <p className="text-gray-600 text-xs">Properties</p>
                        </div>
                        <div className="text-sm border-l border-r border-gray-300">
                            <p className="text-gray-900 font-semibold">24/7</p>
                            <p className="text-gray-600 text-xs">Support</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-900 font-semibold">Secure</p>
                            <p className="text-gray-600 text-xs">Bank-grade</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

