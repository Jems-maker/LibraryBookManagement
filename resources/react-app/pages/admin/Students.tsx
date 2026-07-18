import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { User } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';

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
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.students.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setDeleteTarget(null);
    }
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

        {isLoading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {studentsData?.data.map((student) => (
              <div key={student.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate">{student.name}</div>
                    <div className="text-xs text-gray-500 truncate">{student.email}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{student.student_id}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 w-full">
                  <div className="text-xs text-gray-500">Course: <span className="font-semibold text-gray-700">{student.profile?.course ?? '—'}</span></div>
                  <div className="text-xs text-gray-500">Year: <span className="font-semibold text-gray-700">{student.profile?.year_level ? `${student.profile.year_level}` : '—'}</span></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 font-bold text-xs rounded-lg border border-amber-200">
                    ⭐ {student.total_points ?? 0} pts
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg border border-indigo-200">
                    📚 {student.total_borrows ?? 0} borrows
                  </span>
                </div>
                <div className="mt-3 flex justify-center gap-3 border-t border-gray-100 pt-3 w-full">
                  <button onClick={() => setEditingStudent(student)} title="Edit" className="p-2 rounded-lg bg-white text-blue-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  </button>
                  <button onClick={() => setDeleteTarget(student)} title="Delete" className="p-2 rounded-lg bg-white text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.061-.94-1.75-1.975-1.75H9.225c-1.035 0-1.975.69-1.975 1.75v.916" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {(!studentsData?.data || studentsData.data.length === 0) && (
              <div className="col-span-full text-center py-10 text-gray-400">No students found.</div>
            )}
          </div>
        )}

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

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this student'}? This action cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
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