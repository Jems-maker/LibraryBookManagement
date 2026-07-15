import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { User } from '@/types';

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

import SearchableSelect from '@/components/SearchableSelect';

export default function Students() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.students.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-students'] })
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['admin-students', debouncedSearch, page],
    queryFn: () => adminApi.students.list({ search: debouncedSearch, page }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
        <button onClick={() => setIsAddingStudent(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm">
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Info</th>
                <th className="px-6 py-4 font-semibold">Course & Year</th>
                <th className="px-6 py-4 font-semibold">Points</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : studentsData?.data.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-400">{student.email}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{student.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{student.profile?.course ?? '—'}</div>
                    <div className="text-xs text-gray-400">{student.profile?.year_level ? `Year ${student.profile.year_level}` : '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 font-bold text-xs rounded-lg border border-amber-200">
                      ⭐ {student.total_points ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-xl">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingStudent(student)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4">Edit</button>
                    <button onClick={() => { if (window.confirm('Delete this student?')) deleteMutation.mutate(student.id); }} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {studentsData && studentsData.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing page {studentsData.current_page} of {studentsData.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(studentsData.last_page, p + 1))} disabled={page === studentsData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {editingStudent && (
        <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} />
      )}

      {isAddingStudent && (
        <AddStudentModal onClose={() => setIsAddingStudent(false)} />
      )}
    </div>
  );
}

function EditStudentModal({ student, onClose }: { student: User, onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-all'],
    queryFn: () => adminApi.courses.all(),
  });

  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    student_id: student.student_id,
    course: student.profile?.course || '',
    year_level: student.profile?.year_level || '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => adminApi.students.update(student.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-visible">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
              <input type="text" required value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
              <SearchableSelect
                options={courses?.map((c: any) => ({ label: c.description ? `${c.name} - ${c.description}` : c.name, value: c.name })) || []}
                value={formData.course}
                onChange={(val: string) => setFormData({ ...formData, course: val })}
                placeholder="Select a course"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year Level</label>
              <select required value={formData.year_level} onChange={e => setFormData({ ...formData, year_level: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStudentModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-all'],
    queryFn: () => adminApi.courses.all(),
  });

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    student_id: '',
    course: '',
    year_level: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => adminApi.students.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Error creating student');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');

    mutation.mutate({
      name: fullName,
      email: formData.email,
      student_id: formData.student_id,
      course: formData.course,
      year_level: formData.year_level,
      password: formData.password
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-visible">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
            <div className="sm:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">MI <span className="text-gray-400 font-normal">(Opt)</span></label>
              <input type="text" maxLength={2} value={formData.middleName} onChange={e => setFormData({ ...formData, middleName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-center" />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
              <input type="text" required value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
              <SearchableSelect
                options={courses?.map((c: any) => ({ label: c.description ? `${c.name} - ${c.description}` : c.name, value: c.name })) || []}
                value={formData.course}
                onChange={(val: string) => setFormData({ ...formData, course: val })}
                placeholder="Select a course"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year Level</label>
              <select required value={formData.year_level} onChange={e => setFormData({ ...formData, year_level: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>

              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" minLength={8} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}