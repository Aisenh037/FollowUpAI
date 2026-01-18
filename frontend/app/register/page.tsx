'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/register', { email, password });
            const { access_token } = response.data;

            setToken(access_token);

            // Fetch user info
            const userResponse = await api.get('/api/auth/me');
            setUser(userResponse.data);

            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
            <div className="max-w-md w-full animate-in">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-3 tracking-tighter">
                        FollowUpAI
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                        Scale your follow-ups to the infinite.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Security Key (Password)
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Confirm Key
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 px-4 rounded-2xl transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                'Join FollowUpAI'
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Already part of the network?{' '}
                            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-black hover:underline underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center space-x-6 text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-widest">
                    <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
                    <span>•</span>
                    <a href="#" className="hover:text-primary-500 transition-colors">Support</a>
                </div>
            </div>
        </div>
    );
}
