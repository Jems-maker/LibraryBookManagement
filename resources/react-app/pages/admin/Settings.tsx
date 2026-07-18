import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { refresh } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.settings.get().then(r => r.data)
  });

  const [formData, setFormData] = useState({
    school_name: '',
    librarian_name: '',
    head_role: 'School Principal',
    head_name: '',
    penalty_amount: '10',
    admin_name: '',
    admin_email: '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        school_name: settings.school_name || '',
        librarian_name: settings.librarian_name || '',
        head_role: settings.head_role || 'School Principal',
        head_name: settings.head_name || '',
        penalty_amount: settings.penalty_amount?.toString() || '10',
        admin_name: settings.admin_name || '',
        admin_email: settings.admin_email || '',
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => adminApi.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      refresh();
      alert('Settings updated successfully!');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('school_name', formData.school_name);
    data.append('librarian_name', formData.librarian_name);
    data.append('head_role', formData.head_role);
    data.append('head_name', formData.head_name);
    data.append('penalty_amount', formData.penalty_amount);
    data.append('admin_name', formData.admin_name);
    data.append('admin_email', formData.admin_email);
    if (logo) data.append('logo', logo);
    if (avatar) data.append('avatar', avatar);
    mutation.mutate(data);
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-8xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="p-8 pb-0 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto">
          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Admin Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" value={formData.admin_name} onChange={e => setFormData({ ...formData, admin_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email / Username</label>
                <input type="email" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {settings?.avatar_url && (
                    <div className="w-16 h-16 rounded-full border border-gray-200 p-0.5 shrink-0 overflow-hidden">
                      <img src={settings.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">School Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                <input type="text" value={formData.school_name} onChange={e => setFormData({ ...formData, school_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Logo</label>
                <div className="flex items-center gap-4">
                  {settings?.logo_url && (
                    <div className="w-16 h-16 rounded-xl border border-gray-200 p-2 shrink-0">
                      <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setLogo(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Signatories (For Certificates)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Librarian Name</label>
                <input type="text" value={formData.librarian_name} onChange={e => setFormData({ ...formData, librarian_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Head Title</label>
                <select value={formData.head_role} onChange={e => setFormData({ ...formData, head_role: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="School Principal">School Principal</option>
                  <option value="School President">School President</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Head Name</label>
                <input type="text" value={formData.head_name} onChange={e => setFormData({ ...formData, head_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Library Penalty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Penalty Amount (per 24 hrs overdue, ₱)</label>
                <input type="number" step="0.01" min="0" value={formData.penalty_amount} onChange={e => setFormData({ ...formData, penalty_amount: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

        </div>
        <div className="sticky bottom-0 p-8 border-t border-gray-100 bg-white rounded-b-3xl flex justify-end">
          <button type="submit" disabled={mutation.isPending} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}