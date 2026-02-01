import React, { useState } from 'react';
import { LifeBuoy, Send, CheckCircle, Monitor } from 'lucide-react';
import { createTicket } from '../services/supabaseService';

const SubmitTicket: React.FC = () => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        company_name: '',
        department: '',
        computer_name: '',
        issue_type: 'Software',
        priority: 'Normal',
        description: '',
        remote_id: '',
        remote_password: '',
    });
    const [customCompanyName, setCustomCompanyName] = useState('');
    const [customDepartment, setCustomDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.target.name === 'company_name' && e.target.value !== 'Others') {
            setCustomCompanyName(''); // Reset custom company when selecting a predefined one
        }
        if (e.target.name === 'department' && e.target.value !== 'Others') {
            setCustomDepartment(''); // Reset custom department when selecting a predefined one
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Use custom company name if 'Others' is selected
        const submissionData = {
            ...formData,
            company_name: formData.company_name === 'Others' ? customCompanyName : formData.company_name,
            department: formData.department === 'Others' ? customDepartment : formData.department
        };

        const result = await createTicket(submissionData);

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
                        onClick={() => { setSubmitted(false); setCustomCompanyName(''); setCustomDepartment(''); setFormData({ user_name: '', user_email: '', company_name: '', department: '', computer_name: '', issue_type: 'Software', priority: 'Normal', description: '', remote_id: '', remote_password: '' }); }}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
                            <select
                                name="company_name"
                                required
                                value={formData.company_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="">Select Company</option>
                                <option value="Graduan Bersatu Padat Sdn. Bhd.">Graduan Bersatu Padat Sdn. Bhd.</option>
                                <option value="Greenfield Facility Management Sdn.Bhd.">Greenfield Facility Management Sdn.Bhd.</option>
                                <option value="Bright Pest Service (M) Sdn Bhd">Bright Pest Service (M) Sdn Bhd</option>
                                <option value="Revon Malaya">Revon Malaya</option>
                                <option value="Apollo Logistic Sdn Bhd">Apollo Logistic Sdn Bhd</option>
                                <option value="Max Health Pharma Sdn Bhd">Max Health Pharma Sdn Bhd</option>
                                <option value="Bright Environment Sdn. Bhd.">Bright Environment Sdn. Bhd.</option>
                                <option value="Cool Man Acond Service Sdn Bhd">Cool Man Acond Service Sdn Bhd</option>
                                <option value="Bright Cleaning Service - Enterprise">Bright Cleaning Service - Enterprise</option>
                                <option value="G Cleaning Services - Enterprise">G Cleaning Services - Enterprise</option>
                                <option value="Kaw Kaw Kopitiam">Kaw Kaw Kopitiam</option>
                                <option value="Telur Maju Setia">Telur Maju Setia</option>
                                <option value="SBX Workshop">SBX Workshop</option>
                                <option value="Pentalead Sdn. Bhd.">Pentalead Sdn. Bhd.</option>
                                <option value="Lava's Holiday Sdn Bhd">Lava's Holiday Sdn Bhd</option>
                                <option value="Healix Healthcare Sdn Bhd">Healix Healthcare Sdn Bhd</option>
                                <option value="Others">Others</option>
                            </select>
                            {formData.company_name === 'Others' && (
                                <input
                                    type="text"
                                    value={customCompanyName}
                                    onChange={(e) => setCustomCompanyName(e.target.value)}
                                    required
                                    className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                    placeholder="Enter company name"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="">Select Department</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                <option value="Intern">Intern</option>
                                <option value="Others">Others</option>
                            </select>
                            {formData.department === 'Others' && (
                                <input
                                    type="text"
                                    value={customDepartment}
                                    onChange={(e) => setCustomDepartment(e.target.value)}
                                    required
                                    className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                    placeholder="Enter department name"
                                />
                            )}
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
