"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import toast from 'react-hot-toast';
import {
    Users,
    Clock,
    AlertTriangle,
    Mail,
    Briefcase,
    Rocket,
    Zap,
    Bot,
    Shield,
    Terminal,
    ArrowRight,
    Search,
    Globe
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/agent/stats');
            setStats(response.data);
        } catch (error: any) {
            console.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                <p className="text-sm font-medium text-slate-500">Syncing dashboard...</p>
            </div>
        );
    }

    const quickActions = [
        {
            title: 'Manage Pipeline',
            desc: 'View and edit your prospects',
            href: '/dashboard/leads',
            icon: Users,
            color: 'bg-primary-600',
            textColor: 'text-white'
        },
        {
            title: 'Run AI Agent',
            desc: 'Initiate autonomous outreach',
            href: '/dashboard/agent',
            icon: Bot,
            color: 'bg-slate-900 dark:bg-white',
            textColor: 'text-white dark:text-slate-900'
        },
    ];

    const systemStatus = [
        { label: 'API Gateway', value: 'Operational', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'Neural Engine', value: 'Groq Active', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { label: 'Email Relay', value: 'Resend Ready', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    ];

    return (
        <div className="space-y-10 animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Command Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Real-time status of your autonomous sales operation.</p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Sync Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-500/50 transition-all">
                        <Users className="absolute -right-2 -bottom-2 w-16 h-16 text-primary-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Leads</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_leads}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
                        <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Follow-ups</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.needs_followup}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
                        <AlertTriangle className="absolute -right-2 -bottom-2 w-16 h-16 text-rose-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stalled</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.stalled}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <Mail className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sent Today</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.emails_sent_today}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                        <Briefcase className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Career</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.career_leads}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <Rocket className="absolute -right-2 -bottom-2 w-16 h-16 text-blue-500/5 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Freelance</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.freelance_leads}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg">
                            <Zap className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Operations</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={`flex flex-col p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg ${action.color} ${action.textColor}`}
                            >
                                <action.icon className="w-6 h-6 mb-4" />
                                <span className="font-bold text-lg mb-1">{action.title}</span>
                                <span className="text-xs opacity-70 font-medium">{action.desc}</span>
                                <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider">
                                    Launch <ArrowRight className="w-3 h-3 ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Terminal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Integrity</h2>
                    </div>
                    <div className="space-y-3">
                        {systemStatus.map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group hover:border-slate-200 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color}`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                        <div className="flex items-center space-x-3 text-primary-700 dark:text-primary-400">
                            <Bot className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Optimizer active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
