"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead, LeadCreate, Sequence } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import LeadRow from '@/components/LeadRow';
import {
    Plus,
    Search,
    Download,
    Filter,
    ArrowUpDown,
    Globe,
    UserPlus,
    Ghost,
    X,
    Send
} from 'lucide-react';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<LeadCreate>({
        name: '',
        email: '',
        company: '',
        last_message: '',
        contact_type: 'client',
        resume_link: '',
        tech_stack: '',
        phone: ''
    });

    const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
    const [discoveryQuery, setDiscoveryQuery] = useState('');
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [showCustomEmailModal, setShowCustomEmailModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [customEmail, setCustomEmail] = useState({ subject: '', body: '' });
    const [isSendingCustom, setIsSendingCustom] = useState(false);
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [isAssigning, setIsAssigning] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
        fetchSequences();
    }, []);

    const fetchSequences = async () => {
        try {
            const response = await api.get('/api/sequences');
            setSequences(response.data);
        } catch (error) { }
    };

    const fetchLeads = async () => {
        try {
            const response = await api.get('/api/leads');
            setLeads(response.data);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/leads', formData);
            toast.success('Lead created successfully!');
            setShowModal(false);
            setFormData({
                name: '',
                email: '',
                company: '',
                last_message: '',
                contact_type: 'client',
                resume_link: '',
                tech_stack: '',
                phone: ''
            });
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create lead');
        }
    };

    const handleRunDiscovery = async () => {
        if (!discoveryQuery) return;
        setIsDiscovering(true);
        try {
            const response = await api.post(`/api/discovery/run?query=${encodeURIComponent(discoveryQuery)}`);
            setDiscoveredLeads(response.data.leads);
            toast.success(`Found ${response.data.leads.length} potential leads!`);
        } catch (error) {
            toast.error('Discovery failed');
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleAddBatch = async () => {
        try {
            await api.post('/api/discovery/add-batch', discoveredLeads);
            toast.success('Leads added to pipeline');
            setShowDiscoveryModal(false);
            setDiscoveredLeads([]);
            fetchLeads();
        } catch (error) {
            toast.error('Failed to add leads');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            await api.delete(`/api/leads/${id}`);
            toast.success('Lead deleted');
            fetchLeads();
        } catch (error) {
            toast.error('Failed to delete lead');
        }
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/api/leads/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('CSV exported successfully');
        } catch (error) {
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    const handleRunLeadAgent = async (leadId: number, context?: string) => {
        setActionLoading(leadId);
        try {
            const endpoint = `/api/agent/run-lead/${leadId}${context ? `?context_type=${context}` : ''}`;
            const response = await api.post(endpoint);
            toast.success(response.data.message || 'Processing started!');
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Agent action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendCustomEmail = async () => {
        if (!selectedLead || !customEmail.subject || !customEmail.body) return;
        setIsSendingCustom(true);
        try {
            await api.post('/api/agent/send-custom-email', {
                lead_id: selectedLead.id,
                ...customEmail
            });
            toast.success('Custom email sent!');
            setShowCustomEmailModal(false);
            setCustomEmail({ subject: '', body: '' });
            fetchLeads();
        } catch (error) {
            toast.error('Failed to send custom email');
        } finally {
            setIsSendingCustom(false);
        }
    };

    const openWhatsApp = (phone: string, name: string) => {
        const message = encodeURIComponent(`Hi ${name}, I'm reaching out from...`);
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const handleAssignSequence = async (leadId: number, sequenceId: number | null) => {
        setIsAssigning(leadId);
        try {
            await api.put(`/api/leads/${leadId}`, { sequence_id: sequenceId, current_step_number: 0 });
            toast.success('Sequence assigned!');
            fetchLeads();
        } catch (error) {
            toast.error('Failed to assign sequence');
        } finally {
            setIsAssigning(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leads Pipeline</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">Manage and automate your sales prospects</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setShowDiscoveryModal(true)}
                        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Globe className="w-4 h-4" />
                        <span>Discover</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-500/10"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Lead</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email or company..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white"
                    />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Syncing pipeline data...</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
                    <div className="mb-6 inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                        <Ghost className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pipeline Empty</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto text-sm font-medium">Your sales funnel is currently waiting for new prospects. Start by adding one or use AI discovery.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md shadow-primary-500/20 text-sm"
                    >
                        Initialize First Lead
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900/60 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    {[
                                        { label: 'Prospect', icon: true },
                                        { label: 'Email', icon: false },
                                        { label: 'Phone', icon: false },
                                        { label: 'Company', icon: false },
                                        { label: 'Status', icon: true },
                                        { label: 'Sequence', icon: true },
                                        { label: 'Last Sync', icon: true },
                                        { label: 'Actions', icon: false }
                                    ].map((header) => (
                                        <th key={header.label} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">
                                            <div className="flex items-center space-x-1 hover:text-slate-900 transition-colors cursor-pointer group">
                                                <span>{header.label}</span>
                                                {header.icon && <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {leads
                                    .filter(lead =>
                                        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
                                    )
                                    .map((lead) => (
                                        <LeadRow
                                            key={lead.id}
                                            lead={lead}
                                            sequences={sequences}
                                            isAssigning={isAssigning === lead.id}
                                            actionLoading={actionLoading === lead.id}
                                            onAssignSequence={handleAssignSequence}
                                            onDelete={handleDelete}
                                            onRunAgent={handleRunLeadAgent}
                                            onSendEmail={(l) => {
                                                setSelectedLead(l);
                                                setShowCustomEmailModal(true);
                                            }}
                                            onWhatsApp={openWhatsApp}
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Prospect</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Add a lead to your AI follow-up pipeline.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email *</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Company</label>
                                    <input
                                        type="text"
                                        placeholder="Acme Inc."
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+1..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Contact Type</label>
                                <select
                                    value={formData.contact_type}
                                    onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                >
                                    <option value="client">Freelance Client</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="hr">HR Manager</option>
                                </select>
                            </div>

                            {formData.contact_type !== 'client' && (
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30 space-y-3">
                                    <input
                                        type="url"
                                        placeholder="Resume Link"
                                        value={formData.resume_link}
                                        onChange={(e) => setFormData({ ...formData, resume_link: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded-md text-xs"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tech Stack (React, Node...)"
                                        value={formData.tech_stack}
                                        onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded-md text-xs"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Context / Last Interaction</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief context..."
                                    value={formData.last_message}
                                    onChange={(e) => setFormData({ ...formData, last_message: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white text-sm"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20"
                                >
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Discovery Modal */}
            {showDiscoveryModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Sourcing</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Autonomous discovery via Tavily & Groq.</p>
                            </div>
                            <button onClick={() => setShowDiscoveryModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex space-x-2 mb-8">
                            <input
                                type="text"
                                placeholder="e.g. Hiring managers for React roles at top startups"
                                value={discoveryQuery}
                                onChange={(e) => setDiscoveryQuery(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-slate-300 transition-all text-sm"
                            />
                            <button
                                onClick={handleRunDiscovery}
                                disabled={isDiscovering || !discoveryQuery}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all flex items-center space-x-2 shadow-lg shadow-primary-500/20"
                            >
                                {isDiscovering ? (
                                    <>
                                        <div className="animate-spin w-3 h-3 border-2 border-white rounded-full border-t-transparent" />
                                        <span>Searching</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        <span>Search</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {discoveredLeads.length > 0 && (
                            <div className="space-y-6 animate-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest text-slate-500">Matches Found ({discoveredLeads.length})</h3>
                                    <button onClick={() => setDiscoveredLeads([])} className="text-xs font-bold text-primary-600 hover:underline">Clear Results</button>
                                </div>
                                <div className="space-y-2">
                                    {discoveredLeads.map((lead, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:border-primary-200 transition-all">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-xs shadow-sm font-bold border border-slate-200 dark:border-slate-600">
                                                    {lead.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        <span className="text-primary-600 font-bold">{lead.company}</span> • {lead.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                                {lead.contact_type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddBatch}
                                    className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl transition-all shadow-xl text-sm"
                                >
                                    Import Leads to Pipeline
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Email Modal */}
            {showCustomEmailModal && selectedLead && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Direct Outreach</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">To: {selectedLead.name} ({selectedLead.email})</p>
                            </div>
                            <button onClick={() => setShowCustomEmailModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Re: Collaboration"
                                    value={customEmail.subject}
                                    onChange={(e) => setCustomEmail({ ...customEmail, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Message Body</label>
                                <textarea
                                    rows={5}
                                    placeholder="Write your email here..."
                                    value={customEmail.body}
                                    onChange={(e) => setCustomEmail({ ...customEmail, body: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowCustomEmailModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSendCustomEmail}
                                    disabled={isSendingCustom}
                                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center space-x-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{isSendingCustom ? 'Sending...' : 'Send Message'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
