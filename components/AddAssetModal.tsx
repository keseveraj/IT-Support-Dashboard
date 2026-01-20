import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Asset } from '../types';
import { createAsset, updateAsset } from '../services/supabaseService';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    assetId?: string;
    initialData?: Partial<Asset>;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    assetId,
    initialData
}) => {
    const [formData, setFormData] = useState<Partial<Asset>>({
        asset_tag: '',
        asset_type: 'Laptop',
        brand: '',
        model: '',
        serial_number: '',
        status: 'Active',
        assigned_to_name: '',
        assigned_to_email: '',
        location: '',
        purchase_date: '',
        warranty_expiry: '',
        ...initialData
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                asset_tag: '',
                asset_type: 'Laptop',
                brand: '',
                model: '',
                serial_number: '',
                status: 'Active',
                assigned_to_name: '',
                assigned_to_email: '',
                location: '',
                purchase_date: '',
                warranty_expiry: '',
                ...initialData
            });
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Sanitize date fields
        const assetData = {
            ...formData,
            purchase_date: formData.purchase_date || null,
            warranty_expiry: formData.warranty_expiry || null
        };

        try {
            const result = assetId
                ? await updateAsset(assetId, assetData)
                : await createAsset(assetData);

            if (result && result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result?.error || 'Failed to save asset');
            }
        } catch (err) {
            console.error('Error saving asset:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-white/10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {assetId ? 'Edit Asset' : 'Add New Asset'}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset Tag *</label>
                            <input
                                type="text"
                                name="asset_tag"
                                required
                                value={formData.asset_tag}
                                onChange={handleChange}
                                placeholder="e.g. ASSET-2024-001"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type *</label>
                            <select
                                name="asset_type"
                                value={formData.asset_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            >
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Printer">Printer</option>
                                <option value="Phone">Phone</option>
                                <option value="Tablet">Tablet</option>
                                <option value="Server">Server</option>
                                <option value="Network">Network Device</option>
                                <option value="Software">Software License</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Serial Number</label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
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
                                <option value="In Storage">In Storage</option>
                                <option value="Broken">Broken</option>
                                <option value="Disposed">Disposed</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>

                        <div className="col-span-2 border-t border-gray-100 dark:border-white/10 pt-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Assignment & Location</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To (Name)</label>
                            <input
                                type="text"
                                name="assigned_to_name"
                                value={formData.assigned_to_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To (Email)</label>
                            <input
                                type="email"
                                name="assigned_to_email"
                                value={formData.assigned_to_email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. HQ - Floor 2"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="col-span-2 border-t border-gray-100 dark:border-white/10 pt-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Purchase & Warranty</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Warranty Expiry</label>
                            <input
                                type="date"
                                name="warranty_expiry"
                                value={formData.warranty_expiry}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
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
                            {loading ? 'Saving...' : 'Save Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetModal;
