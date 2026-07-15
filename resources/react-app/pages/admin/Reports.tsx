import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export default function Reports() {
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

    const { data: report, isLoading } = useQuery({
        queryKey: ['admin-reports', from, to],
        queryFn: () => adminApi.reports.list({ from, to }).then(r => r.data),
        staleTime: 2 * 60 * 1000,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            </div>

            {/* Date Filter */}
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
                                        <th className="px-6 py-4 font-semibold text-right">Borrows</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {report.topBooks?.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center py-10 text-gray-400 font-medium">No data for this period.</td></tr>
                                    ) : report.topBooks?.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.book?.title || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.book?.book_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">{item.book?.author?.name || '—'}</span>
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