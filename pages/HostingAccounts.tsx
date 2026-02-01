import React, { useState, useEffect } from 'react';
import { Search, Plus, Cloud, Server, AlertCircle, Edit2, ExternalLink, Download, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { fetchHostingAccounts, deleteHostingAccount } from '../services/supabaseService';
import { HostingAccount } from '../types';
import AddHostingAccountModal from '../components/AddHostingAccountModal';

const HostingAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<HostingAccount[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<HostingAccount | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleOpenCPanel = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<HostingAccount | undefined>(undefined);

    const loadAccounts = async () => {
        const data = await fetchHostingAccounts();
        setAccounts(data);
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const handleAdd = () => {
        setEditingAccount(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, account: HostingAccount) => {
        e.stopPropagation();
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this hosting account?')) {
            await deleteHostingAccount(id);
            loadAccounts();
        }
    };

    const filtered = accounts.filter(acc =>
        acc.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        const headers = ['Provider', 'Account Name', 'Username', 'Company', 'Status', 'Expiry', 'Cost'];
        const rows = filtered.map(acc => [
            acc.provider_name,
            acc.account_name,
            acc.username,
            acc.company_name,
            acc.status,
            acc.expiry_date,
            acc.monthly_cost
        ].map(cell => `"${cell || ''}"`).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hosting_accounts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hosting Accounts</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage server and web hosting credentials</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-white dark:bg-white/10 text-gray-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10">
                        <Download size={18} /> Export
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                        <Plus size={18} /> Add Account
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <div className="max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search provider or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Provider</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Username</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Support</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Renewal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">cPanel</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                                        <p className="text-gray-500 dark:text-gray-400">No hosting accounts found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((acc) => (
                                    <tr key={acc.id} onClick={() => setSelectedAccount(acc)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sky-600 dark:text-sky-400">
                                                    <Cloud size={20} />
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{acc.provider_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.username}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.support_contact || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.renewal_date || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.monthly_cost ? `RM ${acc.monthly_cost}` : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${acc.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{acc.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {acc.control_panel_url ? (
                                                <button
                                                    onClick={(e) => handleOpenCPanel(e, acc.control_panel_url!)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                                >
                                                    <ExternalLink size={12} />
                                                    Open
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={(e) => handleEdit(e, acc)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"><Edit2 size={16} /></button>
                                            <button onClick={(e) => handleDelete(e, acc.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedAccount(null); setShowPassword(false); }}>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {selectedAccount.provider_name}
                                {selectedAccount.account_url && (
                                    <a href={selectedAccount.account_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" onClick={e => e.stopPropagation()}>
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={(e) => { setSelectedAccount(null); setShowPassword(false); handleEdit(e, selectedAccount); }} className="text-primary-600 font-medium text-sm">Edit</button>
                                <button onClick={(e) => { setSelectedAccount(null); setShowPassword(false); handleDelete(e, selectedAccount.id); }} className="text-red-500 font-medium text-sm">Delete</button>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                            {/* cPanel Access Card */}
                            {selectedAccount.control_panel_url && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Server className="text-emerald-600" size={20} />
                                        Control Panel Access
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Username</div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-gray-900 dark:text-white">{selectedAccount.control_panel_username || selectedAccount.username}</span>
                                                <button
                                                    onClick={() => handleCopy(selectedAccount.control_panel_username || selectedAccount.username || '', 'username')}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                                                >
                                                    {copiedField === 'username' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Password</div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-gray-900 dark:text-white">
                                                    {showPassword ? (selectedAccount.control_panel_password_encrypted || selectedAccount.password_encrypted) : '••••••••'}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                                                    >
                                                        {showPassword ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(selectedAccount.control_panel_password_encrypted || selectedAccount.password_encrypted || '', 'password')}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                                                    >
                                                        {copiedField === 'password' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(selectedAccount.control_panel_url!, '_blank')}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={18} />
                                        OPEN CONTROL PANEL
                                    </button>
                                </div>
                            )}

                            {/* Other Details */}
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-3">
                                <p><strong>Provider:</strong> {selectedAccount.provider_name}</p>
                                <p><strong>Account:</strong> {selectedAccount.account_name}</p>
                                <p><strong>Support:</strong> {selectedAccount.support_email || '-'}</p>
                                <p><strong>Renewal:</strong> {selectedAccount.expiry_date || '-'}</p>
                                <p><strong>Cost:</strong> {selectedAccount.monthly_cost ? `RM ${selectedAccount.monthly_cost}` : '-'}</p>
                                <p><strong>Status:</strong> {selectedAccount.status}</p>
                            </div>
                        </div>
                        <button onClick={() => { setSelectedAccount(null); setShowPassword(false); setCopiedField(null); }} className="mt-6 w-full py-2 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300">Close</button>
                    </div>
                </div>
            )}

            <AddHostingAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadAccounts}
                accountId={editingAccount?.id}
                initialData={editingAccount}
            />
        </div>
    );
};

export default HostingAccounts;
