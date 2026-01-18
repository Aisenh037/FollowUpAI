"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    if (!mounted || !isAuthenticated()) {
        return null;
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Leads', href: '/dashboard/leads' },
        { name: 'Sequences', href: '/dashboard/sequences' },
        { name: 'Agent', href: '/dashboard/agent' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                FollowUpAI
                            </h1>

                            <div className="hidden md:flex space-x-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname === item.href
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                {children}
            </main>
        </div>
    );
}
