import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Sparkles, Utensils, HeartHandshake, ShieldCheck, LogOut } from 'lucide-react';

export const DemoAccountBar: React.FC = () => {
  const { user, switchDemoAccount, logout } = useAuth();
  const { showToast } = useNotifications();

  const handleSwitch = async (role: 'DONOR' | 'RECIPIENT' | 'ADMIN') => {
    try {
      await switchDemoAccount(role);
      const roleName = role === 'DONOR' ? 'Donor (GreenLeaf Bistro)' : role === 'RECIPIENT' ? 'Recipient NGO (Hope Haven)' : 'Super Administrator';
      showToast('Switched Account', `Logged in as ${roleName}`, 'success');
    } catch (err: any) {
      showToast('Switch Error', err.message, 'error');
    }
  };

  return (
    <div className="bg-slate-900 dark:bg-charcoal-950 text-slate-100 dark:text-cream-100 text-xs py-1.5 px-4 border-b border-slate-800 dark:border-charcoal-800 flex items-center justify-between flex-wrap gap-2 z-50 transition-colors">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-bold text-citrus-400 uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3 h-3" />
          Hackathon Demo Bar:
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">
          Switch roles instantly:
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => handleSwitch('DONOR')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
            user?.role === 'DONOR'
              ? 'bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Utensils className="w-3 h-3 text-emerald-400" />
          <span>Donor (Restaurant)</span>
        </button>

        <button
          onClick={() => handleSwitch('RECIPIENT')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
            user?.role === 'RECIPIENT'
              ? 'bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <HeartHandshake className="w-3 h-3 text-citrus-400" />
          <span>Recipient (Food Bank)</span>
        </button>

        <button
          onClick={() => handleSwitch('ADMIN')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
            user?.role === 'ADMIN'
              ? 'bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Admin</span>
        </button>

        {user && (
          <button
            onClick={() => {
              logout();
              showToast('Logged Out', 'Signed out from session', 'info');
            }}
            className="flex items-center gap-1 ml-1 px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-800 dark:hover:bg-charcoal-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};
