"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Sequence, SequenceStep } from '@/types';
import toast from 'react-hot-toast';
import {
    Zap,
    Plus,
    Trash2,
    ChevronRight,
    Clock,
    Mail,
    MessageSquare,
    X,
    DraftingCompass
} from 'lucide-react';

export default function SequencesPage() {
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSequence, setNewSequence] = useState({
        name: '',
        description: '',
        steps: [
            { step_number: 1, wait_days: 0, action_type: 'email', template_name: 'cold_mail' }
        ]
    });

    useEffect(() => {
        fetchSequences();
    }, []);

    const fetchSequences = async () => {
        try {
            const response = await api.get('/api/sequences');
            setSequences(response.data);
        } catch (error) {
            toast.error('Failed to load sequences');
        } finally {
            setLoading(false);
        }
    };

    const addStep = () => {
        setNewSequence({
            ...newSequence,
            steps: [
                ...newSequence.steps,
                {
                    step_number: newSequence.steps.length + 1,
                    wait_days: 3,
                    action_type: 'email',
                    template_name: 'saas_offer'
                }
            ]
        });
    };

    const handleCreate = async () => {
        if (!newSequence.name.trim()) {
            toast.error('Protocol Identifier is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/sequences', newSequence);
            toast.success('Sequence created!');
            setShowCreateModal(false);
            setNewSequence({
                name: '',
                description: '',
                steps: [{ step_number: 1, wait_days: 0, action_type: 'email', template_name: 'cold_mail' }]
            });
            fetchSequences();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create sequence');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Terminate this sequence? This will detach it from all leads.')) return;
        try {
            await api.delete(`/api/sequences/${id}`);
            toast.success('Sequence terminated');
            fetchSequences();
        } catch (error) {
            toast.error('Failed to terminate sequence');
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Automation Protocols</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">Define multi-step outreach flows for your leads.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-500/10"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Sequence</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Loading protocols...</p>
                </div>
            ) : sequences.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
                    <div className="mb-6 inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                        <DraftingCompass className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Sequences Defined</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto text-sm font-medium">Create your first automated follow-up sequence to start engaging leads at scale.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md shadow-primary-500/20 text-sm"
                    >
                        Initialize First Protocol
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sequences.map((seq) => (
                        <div key={seq.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all relative">
                            <button
                                onClick={() => handleDelete(seq.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                                    <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white capitalize">{seq.name}</h3>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium line-clamp-2">
                                {seq.description || "Continuous automation protocol for multi-channel lead engagement."}
                            </p>

                            <div className="space-y-3">
                                {seq.steps.sort((a, b) => a.step_number - b.step_number).map((step, idx) => (
                                    <div key={step.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/step">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-[10px] font-bold text-slate-400 w-4">
                                                {idx + 1}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {step.action_type === 'email' ? <Mail className="w-3.5 h-3.5 text-indigo-500" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                    {step.action_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1.5 text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{step.wait_days === 0 ? 'Instant' : `+${step.wait_days}d`}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Sequence Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Design Protocol</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Define the logic for your automated flow.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Sequence Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Inbound SaaS Interest"
                                    value={newSequence.name}
                                    onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Flow Steps</label>
                                    <span className="text-[10px] font-bold text-primary-600 px-2 py-0.5 bg-primary-50 rounded-md border border-primary-100">
                                        {newSequence.steps.length} Steps
                                    </span>
                                </div>

                                {newSequence.steps.map((step, idx) => (
                                    <div key={idx} className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group/edit">
                                        <div className="absolute -left-2 -top-2 w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg">
                                            {idx + 1}
                                        </div>
                                        {newSequence.steps.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const steps = newSequence.steps.filter((_, i) => i !== idx);
                                                    setNewSequence({ ...newSequence, steps });
                                                }}
                                                className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center text-xs shadow-lg opacity-0 group-hover/edit:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Wait Days</label>
                                                <input
                                                    type="number"
                                                    value={step.wait_days}
                                                    onChange={(e) => {
                                                        const steps = [...newSequence.steps];
                                                        steps[idx].wait_days = parseInt(e.target.value) || 0;
                                                        setNewSequence({ ...newSequence, steps });
                                                    }}
                                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                                <select
                                                    value={step.action_type}
                                                    onChange={(e) => {
                                                        const steps = [...newSequence.steps];
                                                        steps[idx].action_type = e.target.value as any;
                                                        setNewSequence({ ...newSequence, steps });
                                                    }}
                                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                >
                                                    <option value="email">Email</option>
                                                    <option value="whatsapp">WhatsApp</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Context</label>
                                                <select
                                                    value={step.template_name || ''}
                                                    onChange={(e) => {
                                                        const steps = [...newSequence.steps];
                                                        steps[idx].template_name = e.target.value;
                                                        setNewSequence({ ...newSequence, steps });
                                                    }}
                                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                >
                                                    <option value="cold_mail">Cold Mail</option>
                                                    <option value="saas_offer">Offer</option>
                                                    <option value="followup">Followup</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addStep}
                                    className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-500/50 hover:bg-primary-50 transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    + Add execution Stage
                                </button>
                            </div>

                            <div className="flex space-x-3 pt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-sm  hover:bg-slate-50 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Save Sequence'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
