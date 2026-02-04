import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Assets from './pages/Assets';
import EmailAccounts from './pages/EmailAccounts';
import Domains from './pages/Domains';
import HostingAccounts from './pages/HostingAccounts';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import SubmitTicket from './pages/SubmitTicket';
import Layout from './components/Layout';
import ChatbotWidget from './components/ChatbotWidget';
import { supabase } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);

  // Check if we're on the public /submit route
  const isSubmitPage = window.location.pathname === '/submit';

  useEffect(() => {
    // Check Supabase session
    const checkSession = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    }

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
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
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
      case 'dashboard': return <Dashboard />;
      case 'tickets': return <Tickets />;
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
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        toggleTheme={toggleTheme}
        isDark={isDark}
      >
        {renderPage()}
      </Layout>

      {/* cPanel Chatbot Widget */}
      <ChatbotWidget />
    </>
  );
};

export default App;
