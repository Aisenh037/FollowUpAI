"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ActivityLog } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    Play,
    Activity,
    Zap,
    Clock,
    AlertCircle,
    Satellite,
    Sparkles,
    Shield,
    Terminal,
    Cpu,
    Database,
    Lock,
    ArrowUpRight
} from 'lucide-react';

export default function AgentPage() {
    const [running, setRunning] = useState(false);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const consoleEl = document.getElementById('console-scroll-container');
        if (consoleEl) {
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }
    }, [activities]);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/api/agent/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Log sync failed');
        } finally {
            setLoading(false);
        }
    };

    const runAgent = async () => {
        setRunning(true);
        try {
            await api.post('/api/agent/run');
            toast.success('Autonomous sequence initiated');
            fetchActivities();
            setTimeout(() => setRunning(false), 10000);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Handshake failed');
            setRunning(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'classified': return <Shield className="w-4 h-4 text-indigo-500" />;
            case 'sent_email': return <Zap className="w-4 h-4 text-emerald-500" />;
            case 'custom_email_sent': return <Satellite className="w-4 h-4 text-blue-500" />;
            case 'started_discovery': return <Sparkles className="w-4 h-4 text-amber-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <Terminal className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200 dark:border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>System Active</span>
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-700">
                            v1.0.42-stable
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agent Control Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Coordinate autonomous outreach and business intelligence tasks.</p>
                </div>

                <button
                    onClick={runAgent}
                    disabled={running}
                    className="group flex items-center space-x-3 bg-slate-900 border-b-4 border-slate-950 dark:bg-white dark:border-slate-200 text-white dark:text-slate-900 font-bold py-3.5 px-8 rounded-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 disabled:opacity-50"
                >
                    <Play className={`w-5 h-5 ${running ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} fill="currentColor" />
                    <span className="uppercase tracking-widest text-sm">{running ? 'Syncing...' : 'Initiate Global Cycle'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Metrics & System Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-primary-500" />
                                Real-time
                            </h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Active Tasks', value: '03', icon: Cpu },
                                { label: 'DB Latency', value: '14ms', icon: Database },
                                { label: 'Security Status', value: 'Locked', icon: Lock },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20 group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-24 h-24" fill="currentColor" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2 flex items-center">
                                Neural Engine
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </h3>
                            <p className="text-primary-100 text-xs font-medium leading-relaxed">
                                The agent is using Llama-3 (70B) for sequence generation and Tavily AI for depth-first discovery runs.
                            </p>
                            <div className="mt-6 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-2/3 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Execution Logs */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-950 dark:bg-slate-950 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px] ring-1 ring-white/5">
                        {/* Terminal Header */}
                        <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="h-4 w-[1px] bg-slate-800" />
                                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                                    <Terminal className="w-3 h-3" />
                                    <span>Core_Executor_Log</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500/70 font-mono">STABLE_IDENTIFIER: 0x42A</span>
                        </div>

                        {/* Terminal Content */}
                        <div id="console-scroll-container" className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
                                    <Terminal className="w-12 h-12 text-slate-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Waiting for incoming signals...</p>
                                </div>
                            ) : (
                                activities.map((log, idx) => (
                                    <div key={idx} className="flex space-x-4 group animate-in slide-in-from-left-2 duration-300">
                                        <span className="text-slate-800 select-none text-[10px] tabular-nums font-bold w-4 mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getIcon(log.action_type)}
                                                </div>
                                                <span className="text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                                                    {log.action_type === 'classified' && (
                                                        <>Target <span className="text-indigo-400 font-bold">{log.details?.lead_name}</span> defined as <span className="text-indigo-400">[{log.details?.new_status?.toUpperCase()}]</span></>
                                                    )}
                                                    {log.action_type === 'sent_email' && (
                                                        <>Cycle <span className="text-emerald-400 font-bold">{log.details?.mode}</span> dispatched to <span className="text-white">{log.details?.lead_name}</span></>
                                                    )}
                                                    {log.action_type === 'custom_email_sent' && (
                                                        <>Direct Uplink: <span className="text-blue-400 font-bold">"{log.details?.subject}"</span> delivered to <span className="text-white">{log.details?.lead_name}</span></>
                                                    )}
                                                    {log.action_type === 'started_discovery' && (
                                                        <>Deep Scan: Initialized search for <span className="text-amber-400 font-bold">"{log.details?.search_query}"</span></>
                                                    )}
                                                    {log.action_type === 'error' && (
                                                        <span className="text-rose-400 font-bold italic">!! CRITICAL_FAIL: {log.details?.error_message || log.details?.error}</span>
                                                    )}
                                                    {!['classified', 'sent_email', 'error', 'custom_email_sent', 'started_discovery'].includes(log.action_type) && log.action_type.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-[10px] text-slate-600 font-bold uppercase pl-7">
                                                <span>{format(new Date(log.created_at), 'HH:mm:ss:SSS')}</span>
                                                <div className="h-[1px] w-4 bg-slate-800" />
                                                <span className={log.action_type === 'error' ? 'text-rose-900' : 'text-slate-700'}>{log.action_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div id="scroll-anchor" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
