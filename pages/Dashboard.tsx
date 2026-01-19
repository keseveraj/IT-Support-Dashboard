import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Clock, CheckCircle, AlertCircle, Plus, MoreHorizontal, Activity } from 'lucide-react';
import { Ticket, Status, Priority } from '../types';
import TicketModal from '../components/TicketModal';
import { fetchTickets, updateTicketStatus } from '../services/supabaseService';

const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto refresh interval
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: Status) => {
    await updateTicketStatus(id, status);
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesSearch = t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'New').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: stats.total, color: 'bg-emerald-600', text: 'text-white', icon: AlertCircle, change: '+5%' },
          { label: 'Pending', value: stats.new, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: Clock, change: '+2' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: Activity, change: '-1' },
          { label: 'Resolved Today', value: stats.resolved, color: 'bg-white dark:bg-dark-card', text: 'text-gray-900 dark:text-white', icon: CheckCircle, change: '+12%' },
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
                <div className={`text-xs font-medium inline-flex items-center px-2 py-1 rounded-lg ${idx === 0 ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                  {stat.change} from yesterday
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl"></div>
            </div>
           )
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        
        {/* Filters Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'New', 'In Progress', 'Resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                  ${filterStatus === status 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search ticket..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:text-gray-200"
               />
             </div>
             <button onClick={loadData} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-white/5 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-500/20">
                        {ticket.issue_type.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {ticket.ticket_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">{ticket.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.user_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{ticket.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
                      ${ticket.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                        ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                        ticket.priority === 'Normal' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' :
                        'bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                      }
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.priority === 'Urgent' ? 'bg-red-500' :
                        ticket.priority === 'High' ? 'bg-orange-500' :
                        ticket.priority === 'Normal' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border
                      ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                        ticket.status === 'New' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                        'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                      }
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTickets.length === 0 && (
             <div className="p-12 text-center text-gray-500 dark:text-gray-400">
               <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
               <p className="text-lg font-medium">No tickets found</p>
               <p className="text-sm">Try adjusting your filters or search terms.</p>
             </div>
          )}
        </div>
      </div>

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