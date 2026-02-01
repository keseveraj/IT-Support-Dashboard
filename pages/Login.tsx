import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { LifeBuoy } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Initial state empty for security
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Admin Login Check
    if (email === 'itsupport@graduanbersatu.com' && password === 'Raj-51121') {
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
          setError('Invalid credentials');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Supabase auth error:', e);
      }
    }

    // If we reach here, neither hardcoded admin nor Supabase auth worked (or Supabase wasn't configured)
    // Add artificial delay if we didn't do Supabase auth to prevent timing attacks
    if (!supabase) {
      await new Promise(r => setTimeout(r, 800));
    }

    setError('Invalid credentials');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100 dark:border-white/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-6">
            <LifeBuoy size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">IT Support Admin</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access the Dashboard</p>
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
                placeholder="admin@graduanbersatu.com"
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
            {loading ? 'Verifying...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/submit" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium hover:underline">
            Need to submit a ticket? Click here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;