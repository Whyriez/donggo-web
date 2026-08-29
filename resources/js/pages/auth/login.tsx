import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const handleDemoFill = () => {
        setData({
            email: 'admin@donggo.id',
            password: 'password123',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
            {/* Back Link */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-600 font-bold text-white text-base shadow-xs mb-3">
                        D
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900">
                        Masuk ke Portal Monitoring
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                        Akses data siswa, riwayat video animasi, dan telemetry dubbing
                    </p>
                </div>

                {status && (
                    <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-xs font-medium text-center">
                        {status}
                    </div>
                )}

                <div className="mt-6 bg-white py-6 px-6 shadow-sm rounded-xl border border-stone-200 sm:px-8">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Email Administrator
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@donggo.id"
                                    required
                                    className="block w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 text-xs transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="block w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 text-xs transition-all"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
                                />
                                <span>Ingat di perangkat ini</span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <span>Memproses...</span>
                            ) : (
                                <>
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Clean Demo Fill Container */}
                    <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                        <div className="text-[11px] text-stone-500 flex items-center justify-between">
                            <span>Akun Demo: <strong className="text-stone-800 font-mono">admin@donggo.id</strong></span>
                            <span>Sandi: <strong className="text-stone-800 font-mono">password123</strong></span>
                        </div>
                        <button
                            type="button"
                            onClick={handleDemoFill}
                            className="w-full py-1.5 px-3 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                            Isi Otomatis Kredensial Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
