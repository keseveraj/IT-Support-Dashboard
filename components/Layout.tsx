import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onLogout, toggleTheme, isDark }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex transition-colors duration-200">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={(page) => {
          onNavigate(page);
          setIsMobileMenuOpen(false);
        }}
        onLogout={onLogout}
        isOpen={isMobileMenuOpen}
      />

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header with Glassmorphism in Dark Mode */}
        <header className="h-20 bg-white dark:bg-dark-card/80 dark:backdrop-blur-xl border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            
            {/* Contextual Title based on Page */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize hidden md:block">
              {currentPage.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search (Visual Only for header) */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-black/20 px-4 py-2.5 rounded-full border border-gray-100 dark:border-white/10 w-64 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none text-sm focus:outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400" 
              />
              <span className="text-xs text-gray-400 font-mono border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">⌘K</span>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
            </button>

            <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-2 hidden md:block"></div>
            
            <div className="flex items-center gap-3 hidden md:flex">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">IT Support Lead</p>
              </div>
              <img src="https://picsum.photos/100" className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-white/10" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;