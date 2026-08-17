import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertCircle, Clock, CheckCircle, XCircle, Eye, Download, Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { Ticket } from '../types';
import { fetchTickets, updateTicketStatus } from '../services/supabaseService';
import TicketModal from '../components/TicketModal';
import ExportCSVModal from '../components/ExportCSVModal';
import AddTicketModal from '../components/AddTicketModal';

const Tickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [priorityFilter, setPriorityFilter] = useState<string>('All');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopySubmitLink = () => {
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        const submitUrl = `${appUrl}/submit`;
        navigator.clipboard.writeText(submitUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const data = await fetchTickets();
        setTickets(data || []);
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, status: any) => {
        await updateTicketStatus(id, status);
        setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
        if (selectedTicket && selectedTicket.id === id) {
            setSelectedTicket({ ...selectedTicket, status });
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.issue_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;

        // Date filtering
        let matchesDate = true;
        if (ticket.created_at) {
            const ticketDate = new Date(ticket.created_at);
            ticketDate.setHours(0, 0, 0, 0); // Normalize to midnight

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (ticketDate < start) matchesDate = false;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // End of day
                if (ticketDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <AlertCircle size={16} className="text-blue-500" />;
            case 'In Progress': return <Clock size={16} className="text-yellow-500" />;
            case 'Resolved': return <CheckCircle size={16} className="text-green-500" />;
            case 'Closed': return <XCircle size={16} className="text-gray-500" />;
            default: return <AlertCircle size={16} className="text-gray-500" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Low': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-600';
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track all support requests</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Copy Public Link Button */}
                    <button
                        onClick={handleCopySubmitLink}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border shadow-sm ${
                            copiedLink
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        title="Copy public ticket submission link to share with staff"
                    >
                        {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Form Link'}</span>
                    </button>

                    {/* Open Public Form in new tab */}
                    <a
                        href="/submit"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        title="Open Public Ticket Submission Form in new tab"
                    >
                        <ExternalLink size={16} />
                        <span>Public Form</span>
                    </a>

                    {/* Export Report Modal */}
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        <span>Export Report</span>
                    </button>

                    {/* Admin Log Task / Ticket Modal */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Log Task / Ticket</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'New').length}</div>
                    <div className="text-sm text-blue-600/70">New</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'In Progress').length}</div>
                    <div className="text-sm text-yellow-600/70">In Progress</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'Resolved').length}</div>
                    <div className="text-sm text-green-600/70">Resolved</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{tickets.length}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex flex-col gap-4">
                    {/* First Row: Search, Status, Priority */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                        >
                            <option value="All">All Status</option>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                        >
                            <option value="All">All Priority</option>
                            <option value="Urgent">Urgent</option>
                            <option value="High">High</option>
                            <option value="Normal">Normal</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    {/* Second Row: Date Range */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="self-end px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Clear Dates
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No tickets found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Issue Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Priority</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Created</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                                            {String(ticket.id).substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.user_name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{ticket.user_email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{ticket.issue_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {ticket.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={"px-2 py-1 text-xs font-medium rounded-lg " + getPriorityBadgeClass(ticket.priority)}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={"inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg " + getStatusBadgeClass(ticket.status)}>
                                                {getStatusIcon(ticket.status)}
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* Ticket Modal */}
            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            {/* Export CSV Modal */}
            {showExportModal && (
                <ExportCSVModal
                    tickets={tickets}
                    onClose={() => setShowExportModal(false)}
                />
            )}

            {/* Quick Log Task / Ticket Modal */}
            {showAddModal && (
                <AddTicketModal
                    onClose={() => setShowAddModal(false)}
                    onTicketCreated={() => loadTickets()}
                />
            )}
        </div>
    );
};

export default Tickets;
