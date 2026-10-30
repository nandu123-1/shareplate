import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Utensils, HeartHandshake, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoAccount } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back!', 'Logged in successfully', 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: 'DONOR' | 'RECIPIENT' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await switchDemoAccount(role);
      showToast('Demo Login Active', `Signed in as ${role}`, 'success');
      if (role === 'DONOR') navigate('/donor/dashboard');
      else if (role === 'RECIPIENT') navigate('/recipient/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Welcome to SharePlate
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
          Sign in to coordinate food surplus donations and collections.
        </p>
      </div>

      {/* Quick 1-Click Demo Login Panel */}
      <div className="p-4 rounded-2xl bg-cream-100 dark:bg-charcoal-850 border border-cream-300 dark:border-charcoal-800 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-forest-950 dark:text-cream-50 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-citrus-500" />
          <span>Instant 1-Click Demo Logins</span>
        </div>
        <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400">
          Select an account role below to immediately explore the platform:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('DONOR')}
            className="p-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 hover:border-forest-700 dark:hover:border-emerald-500 text-center text-xs font-medium text-forest-950 dark:text-cream-100 transition-all shadow-soft-sm group"
          >
            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span>Donor</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('RECIPIENT')}
            className="p-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 hover:border-forest-700 dark:hover:border-emerald-500 text-center text-xs font-medium text-forest-950 dark:text-cream-100 transition-all shadow-soft-sm group"
          >
            <HeartHandshake className="w-4 h-4 text-citrus-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span>NGO</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('ADMIN')}
            className="p-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 hover:border-forest-700 dark:hover:border-emerald-500 text-center text-xs font-medium text-forest-950 dark:text-cream-100 transition-all shadow-soft-sm group"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="e.g. donor@greenleaf.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-charcoal-500 dark:text-charcoal-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-forest-800 dark:text-emerald-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
