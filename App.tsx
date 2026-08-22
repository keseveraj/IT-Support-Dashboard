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

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

// Session timeout: 12 hours (in milliseconds)
const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000;

const DEFAULT_USER: UserProfile = {
  name: 'Raj',
  email: 'itsupport@graduanbersatu.com',
  role: 'IT Support Lead',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem('it_dashboard_user');
      return raw ? JSON.parse(raw) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const rawSession = localStorage.getItem('it_dashboard_session');
      if (rawSession) {
        const session = JSON.parse(rawSession);
        if (session.expiresAt && Date.now() > session.expiresAt) {
          // Session expired
          localStorage.removeItem('it_dashboard_session');
          localStorage.removeItem('it_dashboard_auth');
          return false;
        }
        return session.isAuthenticated === true;
      }
      return localStorage.getItem('it_dashboard_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentPage, setCurrentPage] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'dashboard';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Check if we're on public routes
  const isSubmitPage = window.location.pathname === '/submit';
  const isOnboardingPage = window.location.pathname === '/onboarding';
  const isApprovePage = window.location.pathname.startsWith('/approve/');

  // Periodic session expiration check (checks every minute)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      try {
        const rawSession = localStorage.getItem('it_dashboard_session');
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session.expiresAt && Date.now() > session.expiresAt) {
            console.log('Session expired due to inactivity timeout (12 hours). Logging out.');
            handleLogout();
          }
        }
      } catch (e) {
        console.warn('Session expiration check error:', e);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    // Check Supabase session
    const checkSession = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            saveSession(currentUser);
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
          const email = session.user?.email || 'itsupport@graduanbersatu.com';
          const userObj = {
            name: 'Raj',
            email,
            role: 'IT Support Lead'
          };
          setCurrentUser(userObj);
          saveSession(userObj);
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

  const saveSession = (user: UserProfile) => {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    const sessionData = {
      isAuthenticated: true,
      user,
      loginTime: Date.now(),
      expiresAt,
    };
    localStorage.setItem('it_dashboard_session', JSON.stringify(sessionData));
    localStorage.setItem('it_dashboard_auth', 'true');
    localStorage.setItem('it_dashboard_user', JSON.stringify(user));
  };

  const handleLogin = (user?: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      name: user?.name || 'Raj',
      email: user?.email || 'itsupport@graduanbersatu.com',
      role: user?.role || 'IT Support Lead',
    };
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    saveSession(updatedUser);
  };

  const handleLogout = async () => {
    localStorage.removeItem('it_dashboard_auth');
    localStorage.removeItem('it_dashboard_session');
    localStorage.removeItem('it_dashboard_user');
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
        user={currentUser}
      >
        {renderPage()}
      </Layout>

      {/* cPanel Chatbot Widget */}
      <ChatbotWidget />
    </>
  );
};

export default App;
