'use client';

import { Lead, Sequence } from '@/types';
import { format } from 'date-fns';

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

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            needs_followup: 'bg-yellow-100 text-yellow-700',
            stalled: 'bg-red-100 text-red-700',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    return (
        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs mr-3">
                        {lead.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {lead.name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                {lead.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                {lead.phone || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-400">
                {lead.company || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                    {lead.status.replace('_', ' ')}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    disabled={isAssigning}
                    value={lead.sequence_id || ''}
                    onChange={(e) => onAssignSequence(lead.id, e.target.value ? parseInt(e.target.value) : null)}
                    className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500 w-32"
                >
                    <option value="">No Sequence</option>
                    {sequences.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {lead.sequence_id && (
                    <p className="text-[9px] text-slate-400 mt-1 ml-1 font-bold italic">
                        Step {lead.current_step_number + 1}
                    </p>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {lead.last_contacted_date
                    ? format(new Date(lead.last_contacted_date), 'MMM dd, yyyy')
                    : <span className="text-slate-400 italic">Never</span>
                }
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    {lead.phone && (
                        <button
                            onClick={() => onWhatsApp(lead.phone!, lead.name)}
                            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-all"
                            title="WhatsApp"
                        >
                            📱
                        </button>
                    )}
                    <button
                        onClick={() => onSendEmail(lead)}
                        className="text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/20 p-2 rounded-lg transition-all"
                        title="Custom Email"
                    >
                        ✉️
                    </button>
                    {lead.contact_type === 'client' ? (
                        <button
                            onClick={() => onRunAgent(lead.id, 'saas_offer')}
                            disabled={actionLoading}
                            className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded-lg transition-all flex items-center space-x-1"
                            title="Send SaaS Service Offer"
                        >
                            <span>{actionLoading ? '⏳' : '📧'}</span>
                            <span className="text-[10px] font-black uppercase">SaaS Offer</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onRunAgent(lead.id)}
                            disabled={actionLoading}
                            className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-lg transition-all flex items-center space-x-1"
                            title="Take Followup"
                        >
                            <span>{actionLoading ? '⏳' : '🚀'}</span>
                            <span className="text-[10px] font-black uppercase">Followup</span>
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(lead.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Lead"
                    >
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    );
}
