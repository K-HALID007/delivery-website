"use client";

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import { Users, Search, RefreshCw, Mail, Phone, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const regularUsers = users.filter(user => user.role === 'user');
  const filteredUsers = regularUsers.filter(u => {
    const term = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.phone || '').toLowerCase().includes(term)
    );
  });

  if (loading && users.length === 0) {
    return <AdminPageSkeleton title="Users" showCards={false} showCharts={false} tableRows={8} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Customer Registry</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Registered Users
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Directory of verified client accounts, contact credentials, and registration records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
          </div>

          <span className="text-xs text-slate-700 font-semibold">
            Showing {filteredUsers.length} of {regularUsers.length} registered users
          </span>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3.5 text-left">User Name</th>
                  <th className="px-6 py-3.5 text-left">Contact Info</th>
                  <th className="px-6 py-3.5 text-left">Account Type</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-600 font-medium">
                      No user records matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-sm">{user.name}</span>
                        <span className="font-mono text-slate-600 font-semibold text-[10px] block mt-0.5">ID: {user._id}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-600" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-600" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 capitalize border border-slate-200">
                          {user.role || 'Client'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.isActive !== false 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                            : 'bg-red-50 text-red-800 border border-red-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-xs font-semibold">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
