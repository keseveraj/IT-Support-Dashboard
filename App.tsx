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
import Onboarding from './pages/Onboarding';
import ApproveRequest from './pages/ApproveRequest';
import OnboardingAdmin from './pages/OnboardingAdmin';
import Layout from './components/Layout';
import ChatbotWidget from './components/ChatbotWidget';
import { supabase } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('it_dashboard_auth') === 'true';
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Check if we're on public routes
  const isSubmitPage = window.location.pathname === '/submit';
  const isOnboardingPage = window.location.pathname === '/onboarding';
  const isApprovePage = window.location.pathname.startsWith('/approve/');

  useEffect(() => {
    // Check Supabase session
    const checkSession = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            localStorage.setItem('it_dashboard_auth', 'true');
          }
        } catch (e) {
          console.warn('Session check warning:', e);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          localStorage.setItem('it_dashboard_auth', 'true');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Sync dark class on mount and state change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('it_dashboard_auth', 'true');
  };

  const handleLogout = async () => {
    localStorage.removeItem('it_dashboard_auth');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    setIsAuthenticated(false);
  };

  // Public pages - no login required
  if (isSubmitPage) {
    return <SubmitTicket />;
  }

  if (isOnboardingPage) {
    return <Onboarding />;
  }

  if (isApprovePage) {
    const token = window.location.pathname.split('/approve/')[1];
    return <ApproveRequest token={token} />;
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
      case 'onboarding': return <OnboardingAdmin />;
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
