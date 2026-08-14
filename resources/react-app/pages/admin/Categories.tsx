import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { Category } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function Categories() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['admin-categories', debouncedSearch, page],
        queryFn: () => adminApi.categories.list({ search: debouncedSearch, page }).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminApi.categories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
            setDeleteTarget(null);
            showToast('Category deleted successfully.', 'success');
        }
    });

    const handleDelete = () => {
        if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
    };

    const openModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
                <button
                    onClick={() => openModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
                >
                    + Add New Category
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search categories..."
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
                                <th className="px-6 py-4 font-semibold">Slug</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center py-10 text-gray-400">Loading...</td></tr>
                            ) : categoriesData?.data.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{category.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-400 font-mono">{category.slug}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(category)} title="Edit" className="p-2 rounded-lg bg-white text-blue-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                        </button>
                                        <button onClick={() => setDeleteTarget(category)} title="Delete" className="p-2 rounded-lg bg-white text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.061-.94-1.75-1.975-1.75H9.225c-1.035 0-1.975.69-1.975 1.75v.916" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categoriesData && categoriesData.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Showing page {categoriesData.current_page} of {categoriesData.last_page}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
                            <button onClick={() => setPage(p => Math.min(categoriesData.last_page, p + 1))} disabled={page === categoriesData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Category"
                message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this category'}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

function CategoryModal({ category, onClose }: { category: Category | null, onClose: () => void }) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || '',
    });

    const mutation = useMutation({
        mutationFn: (data: any) => category ? adminApi.categories.update(category.id, data) : adminApi.categories.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
            onClose();
            showToast(category ? 'Category updated successfully.' : 'Category created successfully.', 'success');
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
                    <h2 className="text-xl font-bold text-gray-900">{category ? 'Edit Category' : 'Add New Category'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                        <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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