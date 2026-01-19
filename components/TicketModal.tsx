import React, { useState } from 'react';
import { X, Monitor, Download, MessageSquare, CheckCircle, Clock, Shield, Wifi, Globe, Activity } from 'lucide-react';
import { Ticket, Priority, Status } from '../types';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, onUpdateStatus }) => {
  const [comment, setComment] = useState('');
  
  const handleConnect = () => {
    if (ticket.remote_tool && ticket.remote_id) {
      const protocol = ticket.remote_tool.toLowerCase() === 'anydesk' ? 'anydesk' : 'teamviewer';
      // In a real app, this would trigger the custom protocol
      window.open(`${protocol}://${ticket.remote_id}`, '_self');
    }
  };

  const statusColors = {
    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
    'Waiting': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    'Resolved': 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    'Closed': 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.ticket_number}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created {new Date(ticket.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Remote Access Card - PROMINENT */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-500/10 dark:to-blue-500/10 border border-primary-100 dark:border-primary-500/20 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Monitor className="text-primary-600 dark:text-primary-400" size={20} />
                      Remote Access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Target: <span className="font-mono font-semibold">{ticket.computer_name}</span>
                    </p>
                  </div>
                  {ticket.remote_id ? (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Session ID</div>
                      <div className="text-2xl font-mono font-bold text-primary-700 dark:text-primary-300 tracking-wider">
                        {ticket.remote_id}
                      </div>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-gray-200 dark:bg-white/10 rounded text-xs">No ID</span>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={handleConnect}
                    disabled={!ticket.remote_id}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Activity size={20} />
                    CONNECT NOW
                  </button>
                  <button className="px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-semibold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Issue Description</h3>
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {ticket.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                       {ticket.issue_type}
                     </span>
                     <span className={`px-2 py-1 rounded text-xs border ${
                        ticket.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' :
                        ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20' :
                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                     }`}>
                       {ticket.priority} Priority
                     </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Activity</h3>
                <div className="space-y-4">
                  {ticket.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{c.author[0]}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-lg rounded-tl-none border border-transparent dark:border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{c.author}</span>
                          <span className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add an internal note..."
                    className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
                    rows={2}
                  />
                  <button className="px-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: User Info & Actions */}
            <div className="space-y-6">
              
              {/* User Info */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-4">Requester</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {ticket.user_name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{ticket.user_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.department}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900 dark:text-white font-medium">{ticket.user_email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500">PC Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{ticket.computer_name}</span>
                  </div>
                </div>
              </div>

              {/* Diagnostics */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Wifi size={16} /> Network
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded border border-transparent dark:border-green-500/20">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Shield size={16} /> Antivirus
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded border border-transparent dark:border-green-500/20">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Globe size={16} /> Latency
                    </div>
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded border border-transparent dark:border-yellow-500/20">45ms</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => onUpdateStatus(ticket.id, 'Resolved')}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 shadow-green-600/20"
                  >
                    <CheckCircle size={18} />
                    Mark Resolved
                  </button>
                  
                  <select 
                    value={ticket.status}
                    onChange={(e) => onUpdateStatus(ticket.id, e.target.value as Status)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  >
                    <option value="New">Status: New</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Waiting">Status: Waiting</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>

                  <label className="flex items-center gap-2 p-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-transparent dark:border-white/30" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transition-colors">Add to Knowledge Base</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;