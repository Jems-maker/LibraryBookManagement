import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Courses() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin-courses', debouncedSearch, page],
    queryFn: () => adminApi.courses.list({ search: debouncedSearch, page }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.courses.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm">
          Add Course
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Course Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={3} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : coursesData?.data.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-gray-400 font-medium">No courses found.</td></tr>
              ) : coursesData?.data.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{course.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">{course.description || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(course)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4">Edit</button>
                    <button onClick={() => { if (window.confirm('Delete this course?')) deleteMutation.mutate(course.id); }} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {coursesData && coursesData.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing page {coursesData.current_page} of {coursesData.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(coursesData.last_page, p + 1))} disabled={page === coursesData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CourseModal course={editingCourse} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

function CourseModal({ course, onClose }: { course: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => course ? adminApi.courses.update(course.id, data) : adminApi.courses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Error saving course');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{course ? 'Edit Course' : 'Add Course'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Name / Acronym</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. BSCS" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Bachelor of Science in Computer Science" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
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
