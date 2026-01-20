import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { HostingAccount } from '../types';
import { createHostingAccount, updateHostingAccount } from '../services/supabaseService';

interface AddHostingAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accountId?: string;
    initialData?: Partial<HostingAccount>;
}

const AddHostingAccountModal: React.FC<AddHostingAccountModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    accountId,
    initialData
}) => {
    const [formData, setFormData] = useState<Partial<HostingAccount>>({
        provider_name: '',
        account_url: '',
        username: '',
        password_encrypted: '', // In a real app, this should be encrypted
        support_contact: '',
        monthly_cost: 0,
        renewal_date: '',
        status: 'Active',
        ...initialData
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                provider_name: '',
                account_url: '',
                username: '',
                password_encrypted: '',
                support_contact: '',
                monthly_cost: 0,
                renewal_date: '',
                status: 'Active',
                ...initialData
            });
            setError('');
            setShowPassword(false);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

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
                ? await updateHostingAccount(accountId, formData)
                : await createHostingAccount(formData);

            if (result && result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result?.error || 'Failed to save hosting account');
            }
        } catch (err) {
            console.error('Error saving hosting account:', err);
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
                        {accountId ? 'Edit Hosting Account' : 'Add Hosting Account'}
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
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider Name *</label>
                            <input
                                type="text"
                                name="provider_name"
                                required
                                value={formData.provider_name}
                                onChange={handleChange}
                                placeholder="AWS, DigitalOcean, Hostinger..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login URL</label>
                            <input
                                type="url"
                                name="account_url"
                                value={formData.account_url}
                                onChange={handleChange}
                                placeholder="https://console.provider.com"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username *</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password_encrypted"
                                    value={formData.password_encrypted}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Renewal/Next Bill</label>
                            <input
                                type="date"
                                name="renewal_date"
                                value={formData.renewal_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Contact (Phone/Email)</label>
                            <input
                                type="text"
                                name="support_contact"
                                value={formData.support_contact}
                                onChange={handleChange}
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
                                <option value="Cancelled">Cancelled</option>
                            </select>
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

export default AddHostingAccountModal;
