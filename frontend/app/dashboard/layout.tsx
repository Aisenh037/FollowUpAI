"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Zap,
    Cpu,
    LogOut,
    Bot
} from 'lucide-react';

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
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', href: '/dashboard/leads', icon: Users },
        { name: 'Sequences', href: '/dashboard/sequences', icon: Zap },
        { name: 'Agent', href: '/dashboard/agent', icon: Cpu },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
            {/* Navigation */}
            <nav className="sticky top-0 z-[100] w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="flex items-center space-x-2 group">
                                <div className="p-1.5 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/30">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    FollowUp<span className="text-primary-600">AI</span>
                                </h1>
                            </Link>

                            <div className="hidden md:flex items-center space-x-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname === item.href
                                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
