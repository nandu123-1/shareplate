import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, ShieldAlert, CheckCircle2, UserX, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.getAdminUsers(params);
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(user.id, nextStatus);
      showToast(
        'Status Updated',
        `User ${user.name} is now ${nextStatus.toLowerCase()}`,
        'success'
      );
      loadUsers();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="citrus" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Super Admin
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          User & Organization Management
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Review participating commercial donors, food banks, shelters, and account statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-charcoal-900 p-4 rounded-2xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={e => {
            e.preventDefault();
            loadUsers();
          }}
          className="relative flex-1 w-full"
        >
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          {['', 'DONOR', 'RECIPIENT', 'ADMIN'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-forest-900 dark:bg-emerald-600 text-white'
                  : 'bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-cream-300 dark:border-charcoal-700'
              }`}
            >
              {r || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-12 rounded-xl bg-cream-100 dark:bg-charcoal-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700 dark:text-charcoal-300">
              <thead className="bg-cream-100 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-300 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-charcoal-700">
                <tr>
                  <th className="p-4">User / Representative</th>
                  <th className="p-4">Entity / Organization</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">City / Area</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-charcoal-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-cream-50/80 dark:hover:bg-charcoal-800/60 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-forest-950 dark:text-cream-100 text-sm">{u.name}</p>
                        <p className="text-[11px] text-charcoal-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-charcoal-800 dark:text-cream-200">
                      {u.business_name || u.organization_name || 'Individual Administrator'}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={u.role === 'DONOR' ? 'citrus' : u.role === 'RECIPIENT' ? 'forest' : 'charcoal'}
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-charcoal-500 dark:text-charcoal-400">
                      {u.donor_city || u.recipient_city || 'Metro Central'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.status === 'ACTIVE' ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs ${u.status === 'ACTIVE' ? 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30' : 'text-forest-900 dark:text-emerald-400'}`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
