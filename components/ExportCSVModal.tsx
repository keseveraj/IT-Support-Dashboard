import React, { useState } from 'react';
import { Download, X, Calendar, Columns, Save, RotateCcw } from 'lucide-react';
import { Ticket } from '../types';

const STORAGE_KEY = 'csv_export_default_columns';

interface ExportCSVModalProps {
    tickets: Ticket[];
    onClose: () => void;
}

const COLUMN_OPTIONS = [
    { key: 'ticket_number', label: 'Ticket Number', default: true },
    { key: 'created_at', label: 'Date Created', default: true },
    { key: 'user_name', label: 'User Name', default: true },
    { key: 'user_email', label: 'Email', default: true },
    { key: 'company_name', label: 'Company', default: true },
    { key: 'department', label: 'Department', default: true },
    { key: 'computer_name', label: 'Computer Name', default: false },
    { key: 'issue_type', label: 'Issue Type', default: true },
    { key: 'priority', label: 'Priority', default: true },
    { key: 'status', label: 'Status', default: true },
    { key: 'description', label: 'Description', default: true },
    { key: 'remote_id', label: 'TeamViewer ID', default: false },
    { key: 'remote_password', label: 'TeamViewer Password', default: false },
];

const ExportCSVModal: React.FC<ExportCSVModalProps> = ({ tickets, onClose }) => {
    const [exportFrom, setExportFrom] = useState('');
    const [exportTo, setExportTo] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch {}
        return Object.fromEntries(COLUMN_OPTIONS.map(col => [col.key, col.default]));
    });
    const [savedMessage, setSavedMessage] = useState(false);

    // Generate month options for the last 12 months
    const getMonthOptions = () => {
        const months: { value: string; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            months.push({ value, label });
        }
        return months;
    };

    const handleMonthSelect = (monthValue: string) => {
        setSelectedMonth(monthValue);
        if (monthValue) {
            const [year, month] = monthValue.split('-').map(Number);
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            setExportFrom(firstDay.toISOString().split('T')[0]);
            setExportTo(lastDay.toISOString().split('T')[0]);
        } else {
            setExportFrom('');
            setExportTo('');
        }
    };

    const toggleColumn = (key: string) => {
        setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const selectAllColumns = () => {
        setSelectedColumns(Object.fromEntries(COLUMN_OPTIONS.map(col => [col.key, true])));
    };

    const deselectAllColumns = () => {
        setSelectedColumns(Object.fromEntries(COLUMN_OPTIONS.map(col => [col.key, false])));
    };

    const saveAsDefault = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2000);
    };

    const resetDefaults = () => {
        const defaults = Object.fromEntries(COLUMN_OPTIONS.map(col => [col.key, col.default]));
        setSelectedColumns(defaults);
        localStorage.removeItem(STORAGE_KEY);
    };

    const getSelectedColumnCount = () => Object.values(selectedColumns).filter(Boolean).length;

    const getFilteredTickets = () => {
        return tickets.filter(ticket => {
            if (!ticket.created_at) return !exportFrom && !exportTo;
            const ticketDate = new Date(ticket.created_at);
            ticketDate.setHours(0, 0, 0, 0);

            if (exportFrom) {
                const from = new Date(exportFrom);
                from.setHours(0, 0, 0, 0);
                if (ticketDate < from) return false;
            }
            if (exportTo) {
                const to = new Date(exportTo);
                to.setHours(23, 59, 59, 999);
                if (ticketDate > to) return false;
            }
            return true;
        });
    };

    const getColumnValue = (ticket: Ticket, key: string): string => {
        switch (key) {
            case 'ticket_number': return ticket.ticket_number || '';
            case 'created_at': return ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '';
            case 'user_name': return ticket.user_name || '';
            case 'user_email': return ticket.user_email || '';
            case 'company_name': return ticket.company_name || '';
            case 'department': return ticket.department || '';
            case 'computer_name': return ticket.computer_name || '';
            case 'issue_type': return ticket.issue_type || '';
            case 'priority': return ticket.priority || '';
            case 'status': return ticket.status || '';
            case 'description': return ticket.description ? `"${ticket.description.replace(/"/g, '""')}"` : '';
            case 'remote_id': return ticket.remote_id || '';
            case 'remote_password': return ticket.remote_password || '';
            default: return '';
        }
    };

    const handleExport = () => {
        const exportTickets = getFilteredTickets();
        const activeCols = COLUMN_OPTIONS.filter(col => selectedColumns[col.key]);

        if (activeCols.length === 0) return;

        const headers = activeCols.map(col => col.label);
        const csvData = exportTickets.map(ticket =>
            activeCols.map(col => getColumnValue(ticket, col.key))
        );

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const dateLabel = selectedMonth
            ? selectedMonth
            : exportFrom && exportTo
                ? `${exportFrom}_to_${exportTo}`
                : 'all';

        link.setAttribute('href', url);
        link.setAttribute('download', `tickets_report_${dateLabel}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    const filteredCount = getFilteredTickets().length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Download size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Report</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose date range and columns</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Range Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} className="text-emerald-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Date Range</h3>
                        </div>

                        {/* Quick Month Select */}
                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Quick select by month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => handleMonthSelect(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="">All time</option>
                                {getMonthOptions().map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Date Range */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
                                <input
                                    type="date"
                                    value={exportFrom}
                                    onChange={(e) => { setExportFrom(e.target.value); setSelectedMonth(''); }}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
                                <input
                                    type="date"
                                    value={exportTo}
                                    onChange={(e) => { setExportTo(e.target.value); setSelectedMonth(''); }}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Columns size={18} className="text-emerald-600" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">Columns</h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {getSelectedColumnCount()} selected
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={selectAllColumns}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    All
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button
                                    onClick={deselectAllColumns}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                                >
                                    None
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {COLUMN_OPTIONS.map(col => (
                                <label
                                    key={col.key}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                        selectedColumns[col.key]
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns[col.key]}
                                        onChange={() => toggleColumn(col.key)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className={`text-sm ${
                                        selectedColumns[col.key]
                                            ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {col.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Save / Reset defaults */}
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={saveAsDefault}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                                <Save size={14} />
                                Save as Default
                            </button>
                            <button
                                onClick={resetDefaults}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <RotateCcw size={14} />
                                Reset
                            </button>
                            {savedMessage && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                                    ✓ Defaults saved!
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> ticket{filteredCount !== 1 ? 's' : ''} will be exported
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={getSelectedColumnCount() === 0 || filteredCount === 0}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Download CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportCSVModal;
