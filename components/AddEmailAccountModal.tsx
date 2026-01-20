import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { EmailAccount } from '../types';
import { createEmailAccount, updateEmailAccount } from '../services/supabaseService';

interface AddEmailAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accountId?: string;
    initialData?: Partial<EmailAccount>;
}

const AddEmailAccountModal: React.FC<AddEmailAccountModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    accountId,
    initialData
}) => {
    const [formData, setFormData] = useState<Partial<EmailAccount>>({
        email_address: '',
        email_type: 'M365',
        user_name: '',
        company_name: '',
        status: 'Active',
        mailbox_size_mb: 50000, // Default 50GB
        monthly_cost: 0,
        mfa_enabled: true,
        ...initialData
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                email_address: '',
                email_type: 'M365',
                user_name: '',
                company_name: '',
                status: 'Active',
                mailbox_size_mb: 50000,
                monthly_cost: 0,
                mfa_enabled: true,
                ...initialData
            });
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Handle checkboxes
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Handle numbers
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = accountId
                ? await updateEmailAccount(accountId, formData)
                : await createEmailAccount(formData);

            if (result && result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result?.error || 'Failed to save email account');
            }
        } catch (err) {
            console.error('Error saving email account:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-white/10 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {accountId ? 'Edit Email Account' : 'Add Email Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                            <input
                                type="email"
                                name="email_address"
                                required
                                value={formData.email_address}
                                onChange={handleChange}
                                placeholder="user@company.com"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                            <select
                                name="email_type"
                                value={formData.email_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            >
                                <option value="M365">Microsoft 365</option>
                                <option value="cPanel">cPanel / POP3</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User Name</label>
                            <input
                                type="text"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                                <input
                                    type="number"
                                    name="monthly_cost"
                                    step="0.01"
                                    value={formData.monthly_cost}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2 pt-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    name="mfa_enabled"
                                    checked={formData.mfa_enabled}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-900 dark:text-white font-medium">Multi-Factor Authentication Enabled</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmailAccountModal;
