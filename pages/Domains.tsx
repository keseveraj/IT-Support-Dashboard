import React, { useState, useEffect } from 'react';
import { Search, Plus, Globe, AlertCircle, Edit2, ShieldCheck, ShieldAlert, Timer } from 'lucide-react';
import { fetchDomains } from '../services/supabaseService';
import { Domain } from '../types';
import AddDomainModal from '../components/AddDomainModal';

const Domains: React.FC = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | undefined>(undefined);

    const loadDomains = async () => {
        const data = await fetchDomains();
        setDomains(data);
    };

    useEffect(() => {
        loadDomains();
    }, []);

    const handleAdd = () => {
        setEditingDomain(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, domain: Domain) => {
        e.stopPropagation();
        setEditingDomain(domain);
        setIsModalOpen(true);
    };

    const filtered = domains.filter(d =>
        d.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDaysUntilExpiry = (dateStr: string) => {
        const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getExpiryStatus = (dateStr: string) => {
        const days = getDaysUntilExpiry(dateStr);
        if (days < 0) return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
        if (days < 30) return { text: `${days} days left`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
        if (days < 90) return { text: `${days} days left`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
        return { text: `${days} days left`, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domains</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage domain renewals and DNS</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                    <Plus size={18} /> Add Domain
                </button>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <div className="max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search domain..."
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Domain</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Registrar</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Expiry</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Auto-Renew</th>
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
                                        <p className="text-gray-500 dark:text-gray-400">No domains found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((d) => {
                                    const expiry = getExpiryStatus(d.expiry_date);
                                    return (
                                        <tr key={d.id} onClick={() => setSelectedDomain(d)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                        <Globe size={20} />
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{d.domain_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{d.registrar}</td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 ${expiry.color} font-medium`}>
                                                    <Timer size={16} />
                                                    {d.expiry_date}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{expiry.text}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {d.auto_renew ?
                                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium"><ShieldCheck size={14} /> On</span> :
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-medium"><AlertCircle size={14} /> Off</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{d.renewal_cost ? `$${d.renewal_cost}` : '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>{d.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={(e) => handleEdit(e, d)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"><Edit2 size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDomain && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDomain(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDomain.domain_name}</h2>
                            <button onClick={(e) => { setSelectedDomain(null); handleEdit(e, selectedDomain); }} className="text-primary-600 font-medium text-sm">Edit</button>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Registrar:</strong> {selectedDomain.registrar}</p>
                            <p><strong>Expiry:</strong> {selectedDomain.expiry_date}</p>
                            <p><strong>SSL Expiry:</strong> {selectedDomain.ssl_expiry_date || 'N/A'}</p>
                            <p><strong>Auto-Renew:</strong> {selectedDomain.auto_renew ? 'Yes' : 'No'}</p>
                            <p><strong>Cost:</strong> ${selectedDomain.renewal_cost}</p>
                            <p><strong>Company:</strong> {selectedDomain.company_name}</p>
                            <p><strong>Status:</strong> {selectedDomain.status}</p>
                        </div>
                        <button onClick={() => setSelectedDomain(null)} className="mt-6 w-full py-2 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Close</button>
                    </div>
                </div>
            )}

            <AddDomainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadDomains}
                domainId={editingDomain?.id}
                initialData={editingDomain}
            />
        </div>
    );
};

export default Domains;
