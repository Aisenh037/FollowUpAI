'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/agent/stats');
            setStats(response.data);
        } catch (error: any) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Overview of your sales pipeline and agent activity</p>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-800/50">
                    <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
                    <span>Real-time Sync Active</span>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatsCard title="Total Leads" value={stats.total_leads} icon="👥" color="blue" />
                    <StatsCard title="Needs Follow-up" value={stats.needs_followup} icon="⏰" color="yellow" />
                    <StatsCard title="Stalled Leads" value={stats.stalled} icon="⚠️" color="red" />
                    <StatsCard title="Emails Sent Today" value={stats.emails_sent_today} icon="📧" color="green" />
                    <StatsCard title="Career Leads" value={stats.career_leads} icon="💼" color="purple" />
                    <StatsCard title="Freelance Leads" value={stats.freelance_leads} icon="🚀" color="blue" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <span className="mr-3">⚡</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="/dashboard/leads"
                            className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1"
                        >
                            <span>👥</span>
                            <span>Manage Leads</span>
                        </a>
                        <a
                            href="/dashboard/agent"
                            className="flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:-translate-y-1"
                        >
                            <span>🤖</span>
                            <span>Run AI Agent</span>
                        </a>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <span className="mr-3">🛡️</span> System Status
                    </h2>
                    <div className="space-y-4">
                        {[
                            { label: 'API Status', value: 'Operational', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
                            { label: 'AI Engine', value: 'Groq Active', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
                            { label: 'Email Service', value: 'Resend Active', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">{item.label}</span>
                                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${item.color}`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
