'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead, LeadCreate, Sequence } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import SearchInput from '@/components/SearchInput';
import LeadRow from '@/components/LeadRow';

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

    // Discovery State
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Leads</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your sales prospects and hiring contacts</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm group disabled:opacity-50"
                    >
                        <span>{isExporting ? '⏳' : '📥'}</span>
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                    <button
                        onClick={() => setShowDiscoveryModal(true)}
                        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm group"
                    >
                        <span className="group-hover:scale-125 transition-transform">🔍</span>
                        <span>Source Leads</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
                    >
                        <span>+</span>
                        <span>Add Lead</span>
                    </button>
                </div>
            </div>

            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Filter by name, email or company..."
            />

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 border border-slate-200 dark:border-slate-800 text-center animate-in">
                    <div className="text-6xl mb-6">🏜️</div>
                    <p className="text-slate-500 dark:text-slate-400 text-xl font-medium">No leads in your pipeline yet.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
                    >
                        Add Your First Lead
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    {['Name', 'Email', 'Phone', 'Company', 'Status', 'Sequence', 'Last Contacted', 'Actions'].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">New Prospect</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Add a lead to your AI follow-up pipeline.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { label: 'Name *', key: 'name', type: 'text', placeholder: 'John Doe' },
                                { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@example.com' },
                                { label: 'Company', key: 'company', type: 'text', placeholder: 'Acme Inc.' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        required={field.label.includes('*')}
                                        placeholder={field.placeholder}
                                        value={(formData as any)[field.key]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="+1234567890"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Contact Type
                                </label>
                                <select
                                    value={formData.contact_type}
                                    onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                                >
                                    <option value="client">Freelance Client</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="hr">HR Manager</option>
                                </select>
                            </div>

                            {formData.contact_type !== 'client' && (
                                <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30">
                                    <div>
                                        <label className="block text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-1.5">
                                            Resume Link
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://your-portfolio.me/resume.pdf"
                                            value={formData.resume_link}
                                            onChange={(e) => setFormData({ ...formData, resume_link: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-1.5">
                                            Tech Stack
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="React, Node.js, AI Agents..."
                                            value={formData.tech_stack}
                                            onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Last Message / Brief
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief context about last interaction..."
                                    value={formData.last_message}
                                    onChange={(e) => setFormData({ ...formData, last_message: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                                >
                                    Add Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Discovery Modal */}
            {showDiscoveryModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Sourcing</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Autonomous lead discovery via Tavily & Groq.</p>
                            </div>
                            <button onClick={() => setShowDiscoveryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-2xl">✕</button>
                        </div>

                        <div className="flex space-x-2 mb-8">
                            <input
                                type="text"
                                placeholder="e.g. Hiring managers for React roles at top startups"
                                value={discoveryQuery}
                                onChange={(e) => setDiscoveryQuery(e.target.value)}
                                className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-inner"
                            />
                            <button
                                onClick={handleRunDiscovery}
                                disabled={isDiscovering || !discoveryQuery}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 flex items-center space-x-2"
                            >
                                {isDiscovering ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <span>Search</span>
                                )}
                            </button>
                        </div>

                        {discoveredLeads.length > 0 && (
                            <div className="space-y-6 animate-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-slate-900 dark:text-white tracking-wide uppercase text-xs">Identified Leads ({discoveredLeads.length})</h3>
                                    <button onClick={() => setDiscoveredLeads([])} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">Clear</button>
                                </div>
                                <div className="space-y-3">
                                    {discoveredLeads.map((lead, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-lg shadow-sm">
                                                    👤
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{lead.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        <span className="text-primary-600 dark:text-primary-400 font-bold">{lead.company}</span> • {lead.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                {lead.contact_type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        onClick={handleAddBatch}
                                        className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black py-4 rounded-2xl transition-all shadow-xl"
                                    >
                                        Import All to Pipeline
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isDiscovering && discoveredLeads.length === 0 && discoveryQuery && (
                            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-slate-400 font-medium">No results found yet. Try a more specific query!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Email Modal */}
            {showCustomEmailModal && selectedLead && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Custom Email</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Sending to {selectedLead.name}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="Partnership Opportunity"
                                    value={customEmail.subject}
                                    onChange={(e) => setCustomEmail({ ...customEmail, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Email Body
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Write your email here..."
                                    value={customEmail.body}
                                    onChange={(e) => setCustomEmail({ ...customEmail, body: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="flex space-x-3 pt-6">
                                <button
                                    onClick={() => setShowCustomEmailModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendCustomEmail}
                                    disabled={isSendingCustom}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                                >
                                    {isSendingCustom ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
