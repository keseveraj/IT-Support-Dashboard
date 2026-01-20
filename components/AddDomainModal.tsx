import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Domain } from '../types';
import { createDomain, updateDomain } from '../services/supabaseService';

interface AddDomainModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    domainId?: string;
    initialData?: Partial<Domain>;
}

const AddDomainModal: React.FC<AddDomainModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    domainId,
    initialData
}) => {
    const [formData, setFormData] = useState<Partial<Domain>>({
        domain_name: '',
        registrar: '',
        company_name: '',
        expiry_date: '',
        auto_renew: true,
        status: 'Active',
        renewal_cost: 0,
        ssl_expiry_date: '',
        ...initialData
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                domain_name: '',
                registrar: '',
                company_name: '',
                expiry_date: '',
                auto_renew: true,
                status: 'Active',
                renewal_cost: 0,
                ssl_expiry_date: '',
                ...initialData
            });
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

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
            const result = domainId
                ? await updateDomain(domainId, formData)
                : await createDomain(formData);

            if (result && result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result?.error || 'Failed to save domain');
            }
        } catch (err) {
            console.error('Error saving domain:', err);
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
                        {domainId ? 'Edit Domain' : 'Add New Domain'}
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
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Domain Name *</label>
                            <input
                                type="text"
                                name="domain_name"
                                required
                                value={formData.domain_name}
                                onChange={handleChange}
                                placeholder="example.com"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Registrar *</label>
                            <input
                                type="text"
                                name="registrar"
                                required
                                value={formData.registrar}
                                onChange={handleChange}
                                placeholder="GoDaddy, Namecheap..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date *</label>
                            <input
                                type="date"
                                name="expiry_date"
                                required
                                value={formData.expiry_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SSL Expiry</label>
                            <input
                                type="date"
                                name="ssl_expiry_date"
                                value={formData.ssl_expiry_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Renewal Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="renewal_cost"
                                    step="0.01"
                                    value={formData.renewal_cost}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                                />
                            </div>
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
                                <option value="Expiring Soon">Expiring Soon</option>
                                <option value="Expired">Expired</option>
                                <option value="Transferring">Transferring</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-2 pt-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    name="auto_renew"
                                    checked={formData.auto_renew}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-900 dark:text-white font-medium">Auto-Renewal Enabled</span>
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
                            {loading ? 'Saving...' : 'Save Domain'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDomainModal;
