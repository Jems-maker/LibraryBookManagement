import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { Book, Category, Author, Publisher } from '@/types';
import SearchableSelect from '@/components/SearchableSelect';
import ConfirmModal from '@/components/ConfirmModal';

// Simplified Debounce Hook for local use
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Books() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['admin-books', debouncedSearch, page],
    queryFn: () => adminApi.books.list({ search: debouncedSearch, page }).then(r => r.data),
    staleTime: 2 * 60 * 1000, // 2 minutes for list data
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => adminApi.categories.all(),
    staleTime: 30 * 60 * 1000, // 30 minutes — rarely changes
  });
  const { data: authors = [] } = useQuery({
    queryKey: ['admin-authors-list'],
    queryFn: () => adminApi.authors.all(),
    staleTime: 30 * 60 * 1000,
  });
  const { data: publishers = [] } = useQuery({
    queryKey: ['admin-publishers-list'],
    queryFn: () => adminApi.publishers.all(),
    staleTime: 30 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.books.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setDeleteTarget(null);
    }
  });

  const handleDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const openModal = (book: Book | null = null) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Books Management</h1>
        <button
          onClick={() => openModal(null)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
        >
          + Add New Book
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Book</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : booksData?.data.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {book.cover_image && <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{book.title}</div>
                        <div className="text-xs text-gray-400">{book.author.name}</div>
                        <div className="text-[10px] text-gray-300 font-mono mt-0.5">{book.book_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">{book.category.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{book.available_copies} / {book.total_copies}</span>
                      <span className="text-[10px] text-gray-400">{book.total_borrows} borrows</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${book.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(book)} title="Edit" className="p-2 rounded-lg bg-white text-blue-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    </button>
                    <button onClick={() => setDeleteTarget(book)} title="Delete" className="p-2 rounded-lg bg-white text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.061-.94-1.75-1.975-1.75H9.225c-1.035 0-1.975.69-1.975 1.75v.916" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {booksData && booksData.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing page {booksData.current_page} of {booksData.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(booksData.last_page, p + 1))} disabled={page === booksData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <BookModal
          book={editingBook}
          categories={categories}
          authors={authors}
          publishers={publishers}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Book"
        message={`Are you sure you want to delete ${deleteTarget?.title ?? 'this book'}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function BookModal({ book, categories, authors, publishers, onClose }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author_id: book?.author_id || '',
    category_id: book?.category_id || '',
    publisher_id: book?.publisher_id || '',
    year_of_book: book?.year_of_book || '',
    total_copies: book?.total_copies || 1,
    status: book?.status || 'Available',
    description: book?.description || '',
    is_recommended: book?.is_recommended ? 1 : 0,
  });
  const [cover, setCover] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (data: FormData) => book ? adminApi.books.update(book.id, data) : adminApi.books.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });
    if (cover) data.append('cover_image', cover);
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur">
          <h2 className="text-xl font-bold text-gray-900">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
              <SearchableSelect
                options={authors.map((a: any) => ({ label: a.name, value: a.id }))}
                value={formData.author_id}
                onChange={(val: any) => setFormData({ ...formData, author_id: val })}
                placeholder="Select Author"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Publisher</label>
              <SearchableSelect
                options={publishers.map((p: any) => ({ label: p.name, value: p.id }))}
                value={formData.publisher_id}
                onChange={(val: any) => setFormData({ ...formData, publisher_id: val })}
                placeholder="Select Publisher"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <SearchableSelect
                options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                value={formData.category_id}
                onChange={(val: any) => setFormData({ ...formData, category_id: val })}
                placeholder="Select Category"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Copies</label>
              <input type="number" required min="1" value={formData.total_copies} onChange={e => setFormData({ ...formData, total_copies: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-[10px] text-gray-400 mt-1">Available copies auto-set to total</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year of Book</label>
              <input type="number" value={formData.year_of_book || ''} onChange={e => setFormData({ ...formData, year_of_book: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2020" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}