"use client";

import { Lead, Sequence } from '@/types';
import { format } from 'date-fns';
import {
    Mail,
    MessageSquare,
    Zap,
    Trash2,
    ChevronDown,
    ExternalLink,
    Clock
} from 'lucide-react';

interface LeadRowProps {
    lead: Lead;
    sequences: Sequence[];
    isAssigning: boolean;
    actionLoading: boolean;
    onAssignSequence: (leadId: number, sequenceId: number | null) => void;
    onDelete: (id: number) => void;
    onRunAgent: (leadId: number, context?: string) => void;
    onSendEmail: (lead: Lead) => void;
    onWhatsApp: (phone: string, name: string) => void;
}

export default function LeadRow({
    lead,
    sequences,
    isAssigning,
    actionLoading,
    onAssignSequence,
    onDelete,
    onRunAgent,
    onSendEmail,
    onWhatsApp
}: LeadRowProps) {

    return (
        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all border-b border-slate-200 dark:border-slate-800/50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs mr-3 border border-primary-200 dark:border-primary-800/50">
                        {lead.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-primary-600 transition-colors">
                        {lead.name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {lead.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                {lead.phone || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                {lead.company || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${lead.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : lead.status === 'needs_followup'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                    }`}>
                    {lead.status.replace('_', ' ')}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative inline-block w-40">
                    <select
                        disabled={isAssigning}
                        value={lead.sequence_id || ''}
                        onChange={(e) => onAssignSequence(lead.id, e.target.value ? parseInt(e.target.value) : null)}
                        className="appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">No Sequence</option>
                        {sequences.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                </div>
                {lead.sequence_id && (
                    <div className="mt-1 flex items-center space-x-1.5 ml-1 text-primary-500">
                        <Zap className="w-3 h-3 animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-tight">Step {lead.current_step_number + 1}</span>
                    </div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 mr-1.5 opacity-50" />
                    {lead.last_contacted_date
                        ? format(new Date(lead.last_contacted_date), 'MMM dd')
                        : 'Never'
                    }
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-1">
                    <button
                        onClick={() => lead.phone && onWhatsApp(lead.phone, lead.name)}
                        disabled={!lead.phone}
                        className={`p-1.5 rounded-lg transition-all ${lead.phone
                                ? 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                : 'text-slate-200 dark:text-slate-800 cursor-not-allowed'
                            }`}
                        title={lead.phone ? "Open WhatsApp" : "No phone number provided"}
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onSendEmail(lead)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all"
                        title="Direct Email"
                    >
                        <Mail className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onRunAgent(lead.id)}
                        disabled={actionLoading}
                        className={`p-1.5 rounded-lg transition-all ${actionLoading
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 animate-pulse'
                            : 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                            }`}
                        title="Run Agent"
                    >
                        <Zap className={`w-4 h-4 ${actionLoading ? '' : 'fill-primary-500/20'}`} />
                    </button>
                    <button
                        onClick={() => onDelete(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
