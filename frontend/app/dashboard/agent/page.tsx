'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AgentRunResult, ActivityLog } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AgentPage() {
    const [running, setRunning] = useState(false);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [lastRun, setLastRun] = useState<AgentRunResult | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/api/agent/activities');
            setActivities(response.data);
        } catch (error) {
            toast.error('Failed to load activity log');
        }
    };

    const runAgent = async () => {
        setRunning(true);
        try {
            const response = await api.post('/api/agent/run');
            toast.success(response.data.message || 'Agent started in background!');
            // fetchLatestActivity remains to show subsequent logs

            // Refresh activities
            fetchActivities();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Agent execution failed');
        } finally {
            setRunning(false);
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'classified':
                return '🏷️';
            case 'sent_email':
                return '📧';
            case 'error':
                return '❌';
            default:
                return '📝';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">AI Agent Control</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Orchestrate your autonomous follow-up workflows</p>
                </div>
                <button
                    onClick={runAgent}
                    disabled={running}
                    className="flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 relative overflow-hidden group"
                >
                    {running && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                    <span className="text-xl group-hover:scale-110 transition-transform">
                        {running ? '⏳' : '🚀'}
                    </span>
                    <span>{running ? 'Agent Working...' : 'Run Agent Now'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Status Console */}
                <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-in">
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <span className="ml-4 text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-900 rounded border border-slate-700">
                                agent.v1.0.core
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>System Online</span>
                        </div>
                    </div>

                    <div className="p-6 h-[400px] overflow-y-auto font-mono text-sm space-y-3 custom-scrollbar">
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                                <span className="text-4xl opacity-20">🤖</span>
                                <p className="italic">Waiting for agent invocation...</p>
                            </div>
                        ) : (
                            activities.map((log, idx) => (
                                <div key={idx} className="flex space-x-4 group animate-in">
                                    <span className="text-slate-600 select-none opacity-50 text-xs mt-0.5">[{idx + 1}]</span>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-primary-400 font-bold">$</span>
                                            <span className="text-slate-300 group-hover:text-white transition-colors">
                                                {log.action_type === 'classified' && `Classified lead "${log.details?.lead_name || 'unknown'}" as ${log.details?.new_status}`}
                                                {log.action_type === 'sent_email' && `Sent ${log.details?.email_type} email to "${log.details?.lead_name || 'unknown'}"`}
                                                {log.action_type === 'error' && `ERROR: ${log.details?.error_message || 'Unknown error'}`}
                                                {!['classified', 'sent_email', 'error'].includes(log.action_type) && log.action_type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">
                                            {format(new Date(log.created_at), 'HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info Center */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Intelligence', desc: 'Powered by LangGraph & Groq (Llama 3 70B)', icon: '🧠', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
                        { title: 'Reliability', desc: 'Stateful workflow persistence enabled', icon: '💎', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                        { title: 'Compliance', desc: 'Secure credential handling & SMTP limits', icon: '🛡️', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
                    ].map((feature) => (
                        <div key={feature.title} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
