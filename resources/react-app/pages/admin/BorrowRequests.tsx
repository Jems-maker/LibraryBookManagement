import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { BorrowRequest, PaginatedResponse } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/Toast';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function BorrowRequests() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('Pending');
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-borrow-requests', filter, page],
    queryFn: () => adminApi.borrowRequests.list({ status: filter, page }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.borrowRequests.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      showToast('Borrow request approved successfully.', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to approve request.', 'error');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.borrowRequests.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      showToast('Borrow request rejected.', 'info');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to reject request.', 'error');
    }
  });

  const filters = ['Pending', 'Approved', 'Rejected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Borrow Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or reject book borrowing requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Loading…</div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <p className="font-semibold text-gray-500">No {filter.toLowerCase()} requests</p>
          </div>
        ) : (
          data?.data.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {req.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{req.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{req.user?.student_id || req.user?.email}</p>
                    </div>
                  </div>
                  <div className="ml-1">
                    <p className="font-semibold text-gray-800">{req.book?.title || 'Unknown Book'}</p>
                    <p className="text-sm text-gray-400">by {req.book?.author?.name || '—'}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    <span className="font-semibold">Qty: {req.quantity}</span>
                    <span className="font-semibold">Duration: {req.borrow_duration_days} days</span>
                    <span className="font-semibold">Return by: {req.return_date ? format(parseISO(req.return_date), 'MMM d, yyyy h:mm a') : '—'}</span>
                    <span className="font-semibold">Requested: {req.created_at ? format(parseISO(req.created_at), 'MMM d, h:mm a') : '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={req.status} />
                  {req.status === 'Pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => approveMutation.mutate(req.id)}
                        disabled={approveMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-500/25"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(req.id)}
                        disabled={rejectMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition shadow-lg shadow-red-500/25"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {data.from}–{data.to} of {data.total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === data.last_page} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}