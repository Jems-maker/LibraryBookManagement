import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { format, parseISO } from 'date-fns';
import type { BorrowRecord } from '@/types';

function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

const statusOptions = [
    { value: '', label: 'All Records', color: 'bg-gray-100 text-gray-700' },
    { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-700' },
    { value: 'Pending Claim', label: 'Pending Claim', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Borrowed', label: 'Borrowed', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'Overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
    { value: 'Returned', label: 'Returned', color: 'bg-green-100 text-green-700' },
];

const statusBadge: Record<string, string> = {
    'Pending Claim': 'bg-yellow-100 text-yellow-700',
    'Borrowed': 'bg-indigo-100 text-indigo-700',
    'Overdue': 'bg-red-100 text-red-700',
    'Returned': 'bg-green-100 text-green-700',
};

export default function AdminHistory() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);

    const { data: recordsData, isLoading } = useQuery({
        queryKey: ['admin-borrow-records', debouncedSearch, statusFilter, page],
        queryFn: () =>
            adminApi.borrowRecords
                .list({ search: debouncedSearch, status: statusFilter || undefined, page })
                .then((r) => r.data),
        staleTime: 30 * 1000,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Borrow History</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        {recordsData?.total ?? 0} total record{(recordsData?.total ?? 0) !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by book title, student name, or borrow ID..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-white text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-xl border border-gray-200 bg-white text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Borrow ID</th>
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Book</th>
                                <th className="px-6 py-4 font-semibold">Borrowed</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Returned</th>
                                <th className="px-6 py-4 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : !recordsData || recordsData.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="font-medium">No borrow records found</p>
                                            {search && <p className="text-xs">Try adjusting your search or filters</p>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recordsData.data.map((record: BorrowRecord) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                {record.borrow_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {record.user?.name ?? '—'}
                                            </div>
                                            {record.user?.student_id && (
                                                <span className="text-[11px] text-gray-400 font-mono">
                                                    {record.user.student_id}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-[220px]">
                                            <div className="font-semibold text-gray-900 truncate" title={record.book?.title}>
                                                {record.book?.title ?? '—'}
                                            </div>
                                            {record.book?.author && (
                                                <span className="text-xs text-gray-400">
                                                    by {record.book.author.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {record.borrow_date
                                                ? format(parseISO(record.borrow_date), 'MMM d, yyyy')
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                                            {record.due_date ? (
                                                <span
                                                    className={
                                                        record.status === 'Overdue'
                                                            ? 'text-red-600 font-semibold'
                                                            : 'text-gray-500'
                                                    }
                                                >
                                                    {format(parseISO(record.due_date), 'MMM d, yyyy')}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {record.return_date
                                                ? format(parseISO(record.return_date), 'MMM d, yyyy')
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-xl ${
                                                    statusBadge[record.status] ?? 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {recordsData && recordsData.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing page {recordsData.current_page} of {recordsData.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(recordsData.last_page, p + 1))}
                                disabled={page === recordsData.last_page}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
