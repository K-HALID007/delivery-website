"use client";   
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const regularUsers = users.filter(user => user.role === 'user');

  if (loading) {
    return <AdminPageSkeleton title="Users" showCards={false} showCharts={false} tableRows={8} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-black mb-2">All Users</h1>
          <p className="text-gray-600 text-lg">View and manage all registered users in the system.</p>
        </div>
        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : regularUsers.length === 0 ? (
          <div className="text-center text-gray-500">No users found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">Role</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regularUsers.map((user, idx) => (
                  <tr key={user._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-6 text-black">{user.name}</td>
                    <td className="py-3 px-6 text-black">{user.email}</td>
                    <td className="py-3 px-6 text-black capitalize">{user.role}</td>
                    <td className="py-3 px-6 text-black">{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="py-3 px-6 text-black">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 