import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Server, Globe, Mail,
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Wifi, Printer, Monitor, Shield, Activity, Plus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Ticket, Asset, EmailAccount, Domain, HostingAccount } from '../types';
import {
  fetchTickets, fetchAssets, fetchEmailAccounts,
  fetchDomains, fetchHostingAccounts, updateTicketStatus
} from '../services/supabaseService';
import TicketModal from '../components/TicketModal';

const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUpdateStatus = async (id: string, status: any) => {
    await updateTicketStatus(id, status);
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [
      ticketsData,
      assetsData,
      emailsData,
      domainsData,
      hostingData
    ] = await Promise.all([
      fetchTickets(),
      fetchAssets(),
      fetchEmailAccounts(),
      fetchDomains(),
      fetchHostingAccounts()
    ]);

    setTickets(ticketsData || []);
    setAssets(assetsData || []);
    setEmailAccounts(emailsData || []);
    setDomains(domainsData || []);
    setHostingAccounts(hostingData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // 1 min refresh
    return () => clearInterval(interval);
  }, []);

  // --- Statistics Calculations ---

  const ticketStats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'New').length,
    open: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length,
    urgent: tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length,
    resolvedThisMonth: tickets.filter(t => t.status === 'Resolved' && new Date(t.created_at) > new Date(new Date().setDate(new Date().getDate() - 30))).length
  };

  const assetStats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'Active').length,
    broken: assets.filter(a => a.status === 'Broken').length,
    expiredWarranty: assets.filter(a => a.warranty_expiry && new Date(a.warranty_expiry) < new Date()).length
  };

  const emailStats = {
    total: emailAccounts.length,
    m365: emailAccounts.filter(e => e.email_type === 'M365').length,
    cpanel: emailAccounts.filter(e => e.email_type === 'cPanel').length,
    monthlyCost: emailAccounts.reduce((sum, e) => sum + (e.monthly_cost || 0), 0)
  };

  const domainStats = {
    total: domains.length,
    active: domains.filter(d => d.status === 'Active').length,
    expiringSoon: domains.filter(d => {
      const daysToExpiry = Math.ceil((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry > 0 && daysToExpiry <= 30;
    }).length,
    renewalCost: domains.reduce((sum, d) => {
      const daysToExpiry = Math.ceil((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return (daysToExpiry <= 90) ? sum + (d.renewal_cost || 0) : sum;
    }, 0)
  };

  const totalMonthlyCost =
    emailStats.monthlyCost +
    (domains.reduce((sum, d) => sum + (d.renewal_cost || 0), 0) / 12) + // Approx monthly domain cost
    hostingAccounts.reduce((sum, h) => sum + (h.monthly_cost || 0), 0);


  // --- Warning / Urgent Items Logic ---
  const urgentItems = [
    ...tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').map(t => {
      return {
        type: 'ticket',
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/10',
        message: t.ticket_number + ': ' + t.issue_type + ' - ' + t.description.substring(0, 50) + '...',
        action: 'View Ticket',
        data: t
      };
    }),
    ...domains.filter(d => {
      const days = Math.ceil((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).map(d => {
      const days = Math.ceil((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return {
        type: 'domain',
        icon: Globe,
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        message: 'Domain "' + d.domain_name + '" expires in ' + days + ' days',
        action: 'Renew Now'
      };
    }),
    ...assets.filter(a => a.warranty_expiry && new Date(a.warranty_expiry) < new Date()).map(a => {
      return {
        type: 'asset',
        icon: Shield,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        message: 'Asset ' + a.asset_tag + ' (' + (a.brand || '') + ' ' + (a.model || '') + ') warranty expired',
        action: 'Check'
      };
    })
  ].slice(0, 4); // Limit to top 4

  // --- Mock Chart Data (Line Chart) ---
  // Generate last 30 days history based on tickets created_at
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dayStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const count = tickets.filter(t => new Date(t.created_at).toDateString() === date.toDateString()).length;
    return { name: dayStr, tickets: count };
  });

  // --- Top Issues ---
  const topIssues = Object.entries(
    tickets.reduce((acc: any, t) => {
      acc[t.issue_type] = (acc[t.issue_type] || 0) + 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="text-emerald-600" />
            IT Support Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 pl-9">Overview of entire IT infrastructure</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">KD</div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">kesev@company.com</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>

      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tickets Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <AlertTriangle size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5 today</span>
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400">Tickets</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{ticketStats.open}</span>
              <span className="text-sm text-gray-500">Open</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-50 dark:border-white/5">
              <span> Urgent: <span className="text-red-500 font-bold">{ticketStats.urgent}</span></span>
              <span> New: <span className="text-blue-500 font-bold">{ticketStats.new}</span></span>
            </div>
          </div>
        </div>

        {/* Assets Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Monitor size={24} />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Total: {assetStats.total}</span>
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400">Assets</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{assetStats.active}</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-50 dark:border-white/5">
              <span> Broken: <span className="text-red-500 font-bold">{assetStats.broken}</span></span>
              <span> Warranty: <span className="text-orange-500 font-bold">{assetStats.expiredWarranty}</span></span>
            </div>
          </div>
        </div>

        {/* Emails Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
              <Mail size={24} />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Total: {emailStats.total}</span>
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400">Email Accounts</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">M365:</span>
                <span className="text-2xl font-bold text-purple-600">{emailStats.m365}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">cPanel:</span>
                <span className="text-2xl font-bold text-blue-600">{emailStats.cpanel}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-50 dark:border-white/5">
              <span> Monthly Cost: </span>
              <span className="text-emerald-600 font-bold">RM {emailStats.monthlyCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Domains Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
              <Globe size={24} />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Total: {domainStats.total}</span>
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400">Domains</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{domainStats.active}</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-50 dark:border-white/5">
              <span> Expiring: <span className="text-red-500 font-bold">{domainStats.expiringSoon}</span></span>
              <span> Renew: <span className="text-gray-700 dark:text-gray-300 font-bold">RM {domainStats.renewalCost}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Urgent Items */}
      {urgentItems.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
          <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-bold text-red-700 dark:text-red-400">URGENT ITEMS (Requires Attention)</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {urgentItems.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={"p-2 rounded-lg " + item.bg + " " + item.color}>
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{item.message}</span>
                </div>
                <button
                  onClick={() => item.type === 'ticket' && item.data && setSelectedTicket(item.data)}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Quick Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Stats */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            Quick Stats (This Month)
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <div>
                <p className="text-sm text-gray-500">Tickets Created</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ticketStats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Plus size={20} />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {ticketStats.resolvedThisMonth}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({ticketStats.total > 0 ? Math.round((ticketStats.resolvedThisMonth / ticketStats.total) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <div>
                <p className="text-sm text-gray-500">Top Issue</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {topIssues.length > 0 ? topIssues[0][0] : 'None'}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Ticket Volume (Last 14 Days)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Top Issues & Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues List */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">🎯 Top Issues (All Time)</h3>
          <div className="space-y-4">
            {topIssues.map(([issue, count]: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className={`text - xl font - bold w - 6 ${idx < 3 ? 'text-emerald-600' : 'text-gray-400'} `}>#{idx + 1}</span>
                <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-xl h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-xl transition-all duration-1000"
                    style={{ width: `${(count / (tickets.length || 1)) * 100}% ` }}
                  ></div>
                </div>
                <div className="flex justify-between w-32">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{issue}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Costs */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
            <span>💰 Estimated Monthly Costs</span>
            <span className="text-emerald-600 text-2xl">RM {totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-b border-gray-50 dark:border-white/5">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail size={18} /> Email Accounts (M365/cPanel)
              </span>
              <span className="font-mono font-bold">RM {emailStats.monthlyCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 border-b border-gray-50 dark:border-white/5">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Server size={18} /> Hosting Accounts
              </span>
              <span className="font-mono font-bold">RM {hostingAccounts.reduce((sum, h) => sum + (h.monthly_cost || 0), 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 border-b border-gray-50 dark:border-white/5">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Globe size={18} /> Domain Renewals (Avg/Mo)
              </span>
              <span className="font-mono font-bold">RM {(domains.reduce((sum, d) => sum + (d.renewal_cost || 0), 0) / 12).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Upcoming Renewals */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">📅 Upcoming Renewals (Next 90 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains
            .filter(d => {
              const days = Math.ceil((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return days > 0 && days <= 90;
            })
            .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
            .map((d, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-center bg-white dark:bg-black/20 p-2 rounded-xl min-w-[60px]">
                  <div className="text-xs text-red-500 font-bold uppercase">{new Date(d.expiry_date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{new Date(d.expiry_date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{d.domain_name}</h4>
                  <p className="text-sm text-gray-500">Domain Renewal</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">RM {d.renewal_cost}</p>
                </div>
              </div>
            ))}
          {hostingAccounts.map(h => {
            // Mocking annual renewal logic if date exists, else skip
            return null;
          })}
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Dashboard;
