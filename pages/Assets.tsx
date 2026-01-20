import React, { useState, useEffect } from 'react';
import { Search, Plus, Monitor, Printer, Smartphone, Server, AlertCircle, Edit2, Download, Trash2 } from 'lucide-react';
import { fetchAssets, deleteAsset } from '../services/supabaseService';
import { Asset } from '../types';
import AddAssetModal from '../components/AddAssetModal';

const Assets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);

    const loadAssets = async () => {
        const data = await fetchAssets();
        setAssets(data);
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const handleAddAsset = () => {
        setEditingAsset(undefined);
        setIsModalOpen(true);
    };

    const handleEditAsset = (e: React.MouseEvent, asset: Asset) => {
        e.stopPropagation(); // Prevent opening detail modal
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleDeleteAsset = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this asset?')) {
            await deleteAsset(id);
            loadAssets();
        }
    };

    const handleAssetSuccess = () => {
        loadAssets();
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.assigned_to_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'All' || asset.asset_type === filterType;
        const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    const getAssetIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'laptop':
            case 'desktop':
                return <Monitor size={20} />;
            case 'printer':
                return <Printer size={20} />;
            case 'phone':
            case 'tablet':
                return <Smartphone size={20} />;
            default:
                return <Server size={20} />;
        }
    };

    const getWarrantyStatus = (expiryDate?: string) => {
        if (!expiryDate) return { text: 'N/A', color: 'text-gray-400' };

        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return { text: 'Expired', color: 'text-red-500' };
        if (daysUntilExpiry < 30) return { text: `${daysUntilExpiry} days`, color: 'text-orange-500' };
        if (daysUntilExpiry < 90) return { text: `${daysUntilExpiry} days`, color: 'text-yellow-500' };
        return { text: `${daysUntilExpiry} days`, color: 'text-green-500' };
    };

    const handleExport = () => {
        const headers = ['Asset Tag', 'Type', 'Brand', 'Model', 'Serial', 'Assigned To', 'Status', 'Location'];
        const rows = filteredAssets.map(a => [
            a.asset_tag,
            a.asset_type,
            a.brand,
            a.model,
            a.serial_number,
            a.assigned_to_name,
            a.status,
            a.location
        ].map(cell => `"${cell || ''}"`).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `assets_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">IT Assets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track and manage all company hardware and software</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-white dark:bg-white/10 text-gray-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10">
                        <Download size={18} /> Export
                    </button>
                    <button
                        onClick={handleAddAsset}
                        className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Asset
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by tag, user, or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    >
                        <option value="All">All Types</option>
                        <option value="Laptop">Laptops</option>
                        <option value="Desktop">Desktops</option>
                        <option value="Printer">Printers</option>
                        <option value="Phone">Phones</option>
                        <option value="Tablet">Tablets</option>
                        <option value="Server">Server</option>
                        <option value="Network">Network</option>
                        <option value="Software">Software</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="In Storage">In Storage</option>
                        <option value="Broken">Broken</option>
                        <option value="Disposed">Disposed</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset Tag</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand/Model</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warranty</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                                        <p className="text-gray-500 dark:text-gray-400">No assets found</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or add a new asset</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => {
                                    const warranty = getWarrantyStatus(asset.warranty_expiry);
                                    return (
                                        <tr
                                            key={asset.id}
                                            onClick={() => setSelectedAsset(asset)}
                                            className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                                                        {getAssetIcon(asset.asset_type)}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{asset.asset_tag}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{asset.asset_type}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 dark:text-white font-medium">{asset.brand || 'N/A'}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{asset.model || ''}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 dark:text-white">{asset.assigned_to_name || 'Unassigned'}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{asset.assigned_to_email || ''}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${asset.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    asset.status === 'Broken' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        asset.status === 'Disposed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${warranty.color}`}>
                                                {warranty.text}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => handleEditAsset(e, asset)}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteAsset(e, asset.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Detail Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAsset(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedAsset.asset_tag}
                                    <span className={`text-sm font-normal px-2.5 py-0.5 rounded-full ${selectedAsset.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        selectedAsset.status === 'Broken' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {selectedAsset.status}
                                    </span>
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedAsset.asset_type} • {selectedAsset.brand} {selectedAsset.model}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        setSelectedAsset(null);
                                        handleEditAsset(e, selectedAsset);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAsset(e, selectedAsset.id);
                                        setSelectedAsset(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Equipment Details</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">Serial:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white font-medium">{selectedAsset.serial_number || 'N/A'}</span>

                                    <span className="text-gray-500 dark:text-gray-400">Purchase:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white">{selectedAsset.purchase_date || 'N/A'}</span>

                                    <span className="text-gray-500 dark:text-gray-400">Warranty:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white">{selectedAsset.warranty_expiry || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Assignment</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">User:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white font-medium">{selectedAsset.assigned_to_name || 'Unassigned'}</span>

                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white truncate" title={selectedAsset.assigned_to_email || ''}>
                                        {selectedAsset.assigned_to_email || 'N/A'}
                                    </span>

                                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white">{selectedAsset.location || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedAsset(null)}
                            className="mt-8 w-full py-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )
            }

            {/* Add/Edit Asset Modal */}
            <AddAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAssetSuccess}
                assetId={editingAsset?.id}
                initialData={editingAsset}
            />
        </div >
    );
};

export default Assets;
