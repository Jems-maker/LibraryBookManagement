import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import SearchableSelect from '@/components/SearchableSelect';

export default function Reports() {
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');

    const { data: categories = [] } = useQuery({
        queryKey: ['admin-categories-list'],
        queryFn: () => adminApi.categories.all(),
        staleTime: 30 * 60 * 1000,
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['admin-reports', from, to, categoryId],
        queryFn: () => adminApi.reports.list({ from, to, category_id: categoryId || undefined }).then(r => r.data),
        staleTime: 2 * 60 * 1000,
    });

    const handleDownloadPdf = () => {
        const params = new URLSearchParams();
        params.append('from', from);
        params.append('to', to);
        if (categoryId) params.append('category_id', categoryId);
        window.open(`/api/admin/reports/pdf?${params.toString()}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">From</label>
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">To</label>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        <SearchableSelect
                            options={[{ label: 'All Categories', value: '' }, ...categories.map((c: any) => ({ label: c.name, value: c.id }))]}
                            value={categoryId}
                            onChange={(val: any) => setCategoryId(val)}
                            placeholder="Select Category"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleDownloadPdf}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : report ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="text-sm font-medium text-gray-500">Total Borrows</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{report.totalBorrows}</div>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="text-sm font-medium text-gray-500">Total Returns</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">{report.totalReturns}</div>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="text-sm font-medium text-gray-500">Overdue</div>
                            <div className="text-3xl font-bold text-red-600 mt-2">{report.overdueCount}</div>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="text-sm font-medium text-gray-500">Active Students</div>
                            <div className="text-3xl font-bold text-blue-600 mt-2">{report.activeStudents}</div>
                        </div>
                    </div>

                    {/* Top Books */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Top 5 Most Borrowed Books</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Book</th>
                                        <th className="px-6 py-4 font-semibold">Author</th>
                                        <th className="px-6 py-4 font-semibold">Publisher</th>
                                        <th className="px-6 py-4 font-semibold">Category</th>
                                        <th className="px-6 py-4 font-semibold text-right">Borrows</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {report.topBooks?.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No data for this period.</td></tr>
                                    ) : report.topBooks?.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.book?.title || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.book?.book_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">{item.book?.author?.name || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">{item.book?.publisher?.name || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">{item.book?.category?.name || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-gray-900">{item.borrows}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
