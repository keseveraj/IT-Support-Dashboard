import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { AlertCircle, Clock, Activity, CheckCircle } from 'lucide-react';
import { fetchTickets } from '../services/supabaseService';
import { Ticket } from '../types';

const Analytics: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTickets();
      setTickets(data);
      setLoading(false);
    };
    loadData();
    // Auto refresh every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Real Stats
  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'New').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  // Calculate Priority Data
  const priorityCounts = tickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = [
    { name: 'Urgent', value: priorityCounts['Urgent'] || 0 },
    { name: 'High', value: priorityCounts['High'] || 0 },
    { name: 'Normal', value: priorityCounts['Normal'] || 0 },
    { name: 'Low', value: priorityCounts['Low'] || 0 },
  ];

  // Calculate Issue Type Data (Pie Chart)
  const typeCounts = tickets.reduce((acc, t) => {
    const type = t.issue_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];

  // Helper for Weekly Volume (grouped by day of week)
  const processWeeklyVolume = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const volume = Array(7).fill(0);

    tickets.forEach(ticket => {
      if (!ticket.created_at) return;
      const date = new Date(ticket.created_at);
      // Check if within last 7 days? For now just map all to day of week
      volume[date.getDay()]++;
    });

    // Shift to start from Mon? Recharts handles order by data array order.
    // Let's create standard Mon-Sun array.
    // This simple logic aggregates ALL time by day of week. Good enough for summary.

    return [
      { name: 'Mon', tickets: volume[1] },
      { name: 'Tue', tickets: volume[2] },
      { name: 'Wed', tickets: volume[3] },
      { name: 'Thu', tickets: volume[4] },
      { name: 'Fri', tickets: volume[5] },
      { name: 'Sat', tickets: volume[6] },
      { name: 'Sun', tickets: volume[0] },
    ];
  };

  const trendData = processWeeklyVolume();

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Real-time insights and ticket performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: stats.total, color: 'bg-emerald-600', text: 'text-white', icon: AlertCircle, sub: 'All time' },
          { label: 'Pending', value: stats.new, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: Clock, sub: 'Needs attention' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: Activity, sub: 'Actively working' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: CheckCircle, sub: 'Completed' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`${stat.color} p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group transition-all hover:-translate-y-1`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-sm font-medium opacity-80 ${idx === 0 ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-full ${idx === 0 ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/5'}`}>
                    <Icon size={16} className={idx === 0 ? 'text-white' : 'text-gray-600 dark:text-gray-300'} />
                  </div>
                </div>
                <div className={`text-4xl font-bold mb-2 ${stat.text}`}>{stat.value}</div>
                <div className={`text-xs font-medium inline-flex items-center px-2 py-1 rounded-lg ${idx === 0 ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
                  {stat.sub}
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl"></div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Trend */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="tickets" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Distribution */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Issues by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tickets by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} >
                  {
                    priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Urgent' ? '#ef4444' :
                          entry.name === 'High' ? '#f59e0b' :
                            entry.name === 'Normal' ? '#3b82f6' : '#10b981'
                      } />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
