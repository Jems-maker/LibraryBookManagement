import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { Author } from '@/types';

function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function Authors() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    const { data: authorsData, isLoading } = useQuery({
        queryKey: ['admin-authors', debouncedSearch, page],
        queryFn: () => adminApi.authors.list({ search: debouncedSearch, page }).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminApi.authors.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
            queryClient.invalidateQueries({ queryKey: ['admin-authors-list'] });
        }
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this author?')) {
            deleteMutation.mutate(id);
        }
    };

    const openModal = (author: Author | null = null) => {
        setEditingAuthor(author);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Authors Management</h1>
                <button
                    onClick={() => openModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
                >
                    + Add New Author
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search authors..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Bio</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center py-10 text-gray-400">Loading...</td></tr>
                            ) : authorsData?.data.map((author) => (
                                <tr key={author.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{author.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-400 line-clamp-2">{author.bio || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(author)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4">Edit</button>
                                        <button onClick={() => handleDelete(author.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {authorsData && authorsData.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Showing page {authorsData.current_page} of {authorsData.last_page}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
                            <button onClick={() => setPage(p => Math.min(authorsData.last_page, p + 1))} disabled={page === authorsData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AuthorModal
                    author={editingAuthor}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

function AuthorModal({ author, onClose }: { author: Author | null, onClose: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: author?.name || '',
        bio: author?.bio || '',
    });

    const mutation = useMutation({
        mutationFn: (data: any) => author ? adminApi.authors.update(author.id, data) : adminApi.authors.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
            queryClient.invalidateQueries({ queryKey: ['admin-authors-list'] });
            onClose();
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
                    <h2 className="text-xl font-bold text-gray-900">{author ? 'Edit Author' : 'Add New Author'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                        <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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