import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { LifeBuoy } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Pre-fill demo credentials for easier demo access
  const [email, setEmail] = useState('demo@company.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Demo Login Bypass
    if (email === 'demo@company.com' && password === 'demo123') {
      // Simulate network delay for realism
      await new Promise(r => setTimeout(r, 800));
      onLoginSuccess();
      return;
    }

    // If supabase is configured, try real auth
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Supabase auth error:', e);
        // Fall through to demo login
      }
    } else {
      // Simulate login for demo
      await new Promise(r => setTimeout(r, 800));
      if (email === 'fail@test.com') {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100 dark:border-white/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-6">
            <LifeBuoy size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to IT Support Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="demo@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Demo: demo@company.com / demo123
        </p>
      </div>
    </div>
  );
};

export default Login;