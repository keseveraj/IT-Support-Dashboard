import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Users, AlertCircle, Edit2, ShieldCheck, ShieldAlert, Filter, Download, Trash2 } from 'lucide-react';
import { fetchEmailAccounts, deleteEmailAccount } from '../services/supabaseService';
import { EmailAccount } from '../types';
import AddEmailAccountModal from '../components/AddEmailAccountModal';

const EmailAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<EmailAccount | undefined>(undefined);
    const [filterCompany, setFilterCompany] = useState('All');
    const [filterType, setFilterType] = useState('All');

    const loadAccounts = async () => {
        const data = await fetchEmailAccounts();
        setAccounts(data);
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const handleAdd = () => {
        setEditingAccount(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, account: EmailAccount) => {
        e.stopPropagation();
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this email account?')) {
            await deleteEmailAccount(id);
            loadAccounts();
        }
    };

    const companies = ['All', ...Array.from(new Set(accounts.map(a => a.company_name).filter(Boolean)))];
    const types = ['All', ...Array.from(new Set(accounts.map(a => a.email_type).filter(Boolean)))];

    const filtered = accounts.filter(acc => {
        const matchesSearch = acc.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (acc.user_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = filterCompany === 'All' || acc.company_name === filterCompany;
        const matchesType = filterType === 'All' || acc.email_type === filterType;
        return matchesSearch && matchesCompany && matchesType;
    });

    const handleExport = () => {
        const headers = ['Email Address', 'Type', 'Company', 'User', 'Status', 'Cost', 'MFA'];
        const rows = filtered.map(acc => [
            acc.email_address,
            acc.email_type,
            acc.company_name,
            acc.user_name,
            acc.status,
            acc.monthly_cost,
            acc.mfa_enabled ? 'Yes' : 'No'
        ].map(cell => `"${cell || ''}"`).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `email_accounts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Accounts</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage M365 and cPanel email accounts</p>
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

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Company Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
                        >
                            {companies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
                        >
                            {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search email or user..."
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Email Address</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Company</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">MFA</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                                        <p className="text-gray-500 dark:text-gray-400">No accounts found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((acc) => (
                                    <tr key={acc.id} onClick={() => setSelectedAccount(acc)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${acc.email_type === 'M365' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                                                    <Mail size={20} />
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{acc.email_address}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.email_type}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{acc.company_name}</td>
                                        <td className="px-6 py-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Users size={16} className="text-gray-400" /> {acc.user_name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {acc.mfa_enabled ?
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium"><ShieldCheck size={14} /> On</span> :
                                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium"><ShieldAlert size={14} /> Off</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{acc.monthly_cost ? `RM ${acc.monthly_cost}` : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${acc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{acc.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAccount(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAccount.email_address}</h2>
                            <div className="flex gap-2">
                                <button onClick={(e) => { setSelectedAccount(null); handleEdit(e, selectedAccount); }} className="text-primary-600 font-medium text-sm">Edit</button>
                                <button onClick={(e) => { setSelectedAccount(null); handleDelete(e, selectedAccount.id); }} className="text-red-500 font-medium text-sm">Delete</button>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Type:</strong> {selectedAccount.email_type}</p>
                            <p><strong>User:</strong> {selectedAccount.user_name}</p>
                            <p><strong>Company:</strong> {selectedAccount.company_name}</p>
                            <p><strong>Status:</strong> {selectedAccount.status}</p>
                            <p><strong>MFA:</strong> {selectedAccount.mfa_enabled ? 'Yes' : 'No'}</p>
                            <p><strong>Cost:</strong> RM {selectedAccount.monthly_cost}</p>
                            <p><strong>Size:</strong> {(selectedAccount.mailbox_size_mb || 0) / 1000} GB</p>
                        </div>
                        <button onClick={() => setSelectedAccount(null)} className="mt-6 w-full py-2 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Close</button>
                    </div>
                </div>
            )}

            <AddEmailAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadAccounts}
                accountId={editingAccount?.id}
                initialData={editingAccount}
            />
        </div>
    );
};

export default EmailAccounts;
