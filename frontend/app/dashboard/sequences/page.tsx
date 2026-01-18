'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Sequence, SequenceStep } from '@/types';
import toast from 'react-hot-toast';

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
        try {
            await api.post('/api/sequences', newSequence);
            toast.success('Sequence created!');
            setShowCreateModal(false);
            fetchSequences();
        } catch (error) {
            toast.error('Failed to create sequence');
        }
    };

    return (
        <div className="space-y-8 animate-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Outreach Sequences</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Define multi-step automated follow-ups</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-primary-500/20"
                >
                    + Create Sequence
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sequences.map((seq) => (
                        <div key={seq.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{seq.name}</h3>
                                <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none">
                                    {seq.steps.length} Steps
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{seq.description || 'No description provided.'}</p>

                            <div className="space-y-3">
                                {seq.steps.map((step, idx) => (
                                    <div key={step.id} className="flex items-center space-x-3 text-xs">
                                        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 text-slate-600 dark:text-slate-300 font-medium">
                                            {step.action_type === 'email' ? '📧 Email' : '📱 WhatsApp'}
                                            <span className="text-slate-400 px-2">•</span>
                                            {step.wait_days === 0 ? 'Immediately' : `Wait ${step.wait_days}d`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Build Sequence</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Design your automated outreach workflow.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sequence Name</label>
                                <input
                                    type="text"
                                    placeholder="SaaS Sales High Priority"
                                    value={newSequence.name}
                                    onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Outreach Steps</label>
                                {newSequence.steps.map((step, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Wait Days</label>
                                            <input
                                                type="number"
                                                value={step.wait_days}
                                                onChange={(e) => {
                                                    const steps = [...newSequence.steps];
                                                    steps[idx].wait_days = parseInt(e.target.value);
                                                    setNewSequence({ ...newSequence, steps });
                                                }}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Action</label>
                                            <select
                                                value={step.action_type}
                                                onChange={(e) => {
                                                    const steps = [...newSequence.steps];
                                                    steps[idx].action_type = e.target.value as any;
                                                    setNewSequence({ ...newSequence, steps });
                                                }}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            >
                                                <option value="email">Email</option>
                                                <option value="whatsapp">WhatsApp</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Context</label>
                                            <select
                                                value={step.template_name || ''}
                                                onChange={(e) => {
                                                    const steps = [...newSequence.steps];
                                                    steps[idx].template_name = e.target.value;
                                                    setNewSequence({ ...newSequence, steps });
                                                }}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            >
                                                <option value="cold_mail">Cold Mail</option>
                                                <option value="saas_offer">SaaS Offer</option>
                                                <option value="followup">Default Followup</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addStep}
                                    className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-all font-bold text-sm"
                                >
                                    + Add Next Step
                                </button>
                            </div>

                            <div className="flex space-x-3 pt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                                >
                                    Save Sequence
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
