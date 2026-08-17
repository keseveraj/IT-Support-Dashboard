import React, { useState } from 'react';
import { X, Plus, Calendar, User, Building, Laptop, Tag, FileText, CheckCircle } from 'lucide-react';
import { createTicket } from '../services/supabaseService';
import { Ticket, IssueType, Priority, Status } from '../types';

interface AddTicketModalProps {
    onClose: () => void;
    onTicketCreated: () => void;
}

const CATEGORY_OPTIONS = [
    'Email Configuration',
    'Troubleshoot',
    'Maintenance',
    'Laptop configuration',
    'PC Repair',
    'Server',
    'Network',
    'Software',
    'Hardware',
    'Others',
];

const AddTicketModal: React.FC<AddTicketModalProps> = ({ onClose, onTicketCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        company_name: 'Graduan Bersatu',
        department: '',
        computer_name: '',
        issue_type: 'Maintenance',
        customCategory: '',
        priority: 'Normal' as Priority,
        status: 'Resolved' as Status,
        description: '',
        created_at: new Date().toISOString().slice(0, 10), // default to today
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const category = formData.issue_type === 'Others' && formData.customCategory.trim()
            ? formData.customCategory.trim()
            : formData.issue_type;

        // Create the ticket
        const result = await createTicket({
            user_name: formData.user_name || 'IT Admin',
            user_email: formData.user_email || 'it.support@graduanbersatu.com.my',
            company_name: formData.company_name,
            department: formData.department || 'IT / Operations',
            computer_name: formData.computer_name,
            issue_type: category,
            priority: formData.priority,
            description: formData.description,
        });

        if (result.success) {
            onTicketCreated();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Plus size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Task / Ticket</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Add discussion, secondary issue, or maintenance task</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Category & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <select
                                value={formData.issue_type}
                                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white font-medium"
                                required
                            >
                                {CATEGORY_OPTIONS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Date Created
                            </label>
                            <input
                                type="date"
                                value={formData.created_at}
                                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {formData.issue_type === 'Others' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Custom Category Name</label>
                            <input
                                type="text"
                                value={formData.customCategory}
                                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                placeholder="e.g. Domain Renewal, Server Meeting, Backup"
                                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Task Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Task / Discussion Description *
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g. Discussion with Digital marketing team regarding website SEO OR Weekly Wifi Router Maintenance"
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white resize-none"
                            required
                        />
                    </div>

                    {/* Requestor & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Requestor / Target *
                            </label>
                            <input
                                type="text"
                                value={formData.user_name}
                                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                placeholder="e.g. HR Server, Kumaran, Finance Floor"
                                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Company / Client
                            </label>
                            <input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="e.g. Graduan Bersatu, Coolmanac"
                                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Department / PC & Priority / Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white"
                            >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 dark:text-white font-medium"
                            >
                                <option value="Resolved">Resolved (Completed)</option>
                                <option value="In Progress">In Progress</option>
                                <option value="New">New</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <CheckCircle size={17} />
                            {loading ? 'Saving...' : 'Save Task to Tickets'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTicketModal;
