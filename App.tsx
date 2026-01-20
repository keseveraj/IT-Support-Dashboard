import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import EmailAccounts from './pages/EmailAccounts';
import Domains from './pages/Domains';
import HostingAccounts from './pages/HostingAccounts';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import SubmitTicket from './pages/SubmitTicket';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);

  // Check if we're on the public /submit route
  const isSubmitPage = window.location.pathname === '/submit';

  useEffect(() => {
    // Check local storage for session
    const session = localStorage.getItem('supabase-auth-token'); // Mock check
    if (session) setIsAuthenticated(true);

    // Check theme
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('supabase-auth-token', 'mock-token');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('supabase-auth-token');
  };

  // Public submit page - no login required
  if (isSubmitPage) {
    return <SubmitTicket />;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Analytics />;
      case 'tickets': return <Dashboard />;
      case 'assets': return <Assets />;
      case 'email-accounts': return <EmailAccounts />;
      case 'domains': return <Domains />;
      case 'hosting-accounts': return <HostingAccounts />;
      case 'knowledge-base': return <KnowledgeBase />;
      case 'knowledge-base': return <KnowledgeBase />;
      default: return <Analytics />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      toggleTheme={toggleTheme}
      isDark={isDark}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
