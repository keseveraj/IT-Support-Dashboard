import React from 'react';
import { LayoutDashboard, Book, BarChart2, Settings, LogOut, LifeBuoy, Package, Mail, Globe, Cloud, Ticket } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'email-accounts', label: 'Email Accounts', icon: Mail },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'hosting-accounts', label: 'Hosting', icon: Cloud },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Book },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-white/5 
      transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <LifeBuoy size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">IT Desk</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}

          <div className="mt-8">
            <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
              <Settings size={20} />
              Settings
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-transparent dark:border-white/5">
            <img src="https://picsum.photos/100" alt="Admin" className="w-10 h-10 rounded-full border-2 border-white dark:border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;