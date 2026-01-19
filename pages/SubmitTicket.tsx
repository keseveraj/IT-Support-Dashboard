import React, { useState } from 'react';
import { LifeBuoy, Send, CheckCircle, Monitor } from 'lucide-react';
import { createTicket } from '../services/supabaseService';

const SubmitTicket: React.FC = () => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        department: '',
        computer_name: '',
        issue_type: 'Software',
        priority: 'Normal',
        description: '',
        remote_id: '',
        remote_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createTicket(formData);

        if (result.success) {
            setTicketNumber(result.ticketNumber || 'Submitted');
            setSubmitted(true);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ticket Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Your ticket number is:</p>
                    <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                        {ticketNumber}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        IT Support will contact you shortly. Keep this number for reference.
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); setFormData({ user_name: '', user_email: '', department: '', computer_name: '', issue_type: 'Software', priority: 'Normal', description: '', remote_id: '', remote_password: '' }); }}
                        className="mt-6 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-white transition-colors"
                    >
                        Submit Another Ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-4">
                        <LifeBuoy size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">IT Support Request</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Fill out the form below to submit a support ticket</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="user_name"
                                required
                                value={formData.user_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input
                                type="email"
                                name="user_email"
                                required
                                value={formData.user_email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                placeholder="john@company.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="">Select Department</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Computer Name</label>
                            <input
                                type="text"
                                name="computer_name"
                                value={formData.computer_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                placeholder="PC-SALES-01"
                            />
                        </div>
                    </div>

                    {/* Issue Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type *</label>
                            <select
                                name="issue_type"
                                required
                                value={formData.issue_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="Software">Software Issue</option>
                                <option value="Hardware">Hardware Issue</option>
                                <option value="Network">Network/Internet</option>
                                <option value="Email">Email Problem</option>
                                <option value="Printer">Printer Issue</option>
                                <option value="Access">Access/Permissions</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="Low">Low - Can wait</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High - Affecting work</option>
                                <option value="Urgent">Urgent - Cannot work</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe Your Issue *</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-none"
                            placeholder="Please describe your issue in detail..."
                        />
                    </div>

                    {/* TeamViewer Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                            <Monitor size={20} className="text-blue-600" />
                            TeamViewer Remote Access (Optional)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Provide your TeamViewer credentials so IT can remotely assist you faster.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TeamViewer ID</label>
                                <input
                                    type="text"
                                    name="remote_id"
                                    value={formData.remote_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-mono"
                                    placeholder="123 456 789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="text"
                                    name="remote_password"
                                    value={formData.remote_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-mono"
                                    placeholder="abc123"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Don't have TeamViewer?{' '}
                            <a
                                href="https://www.teamviewer.com/en/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                Download it here →
                            </a>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Submitting...'
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Ticket
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Need urgent help? Call IT Support directly at <strong>ext. 1234</strong>
                </p>
            </div>
        </div>
    );
};

export default SubmitTicket;
