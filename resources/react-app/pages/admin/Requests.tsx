import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function BorrowRequests() {
  const [status, setStatus] = useState('Pending');
  const [page, setPage] = useState(1);
  const [approvingReq, setApprovingReq] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Track previous notification count so we only refetch when something changes
  const prevPendingRef = useRef<number | null>(null);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['admin-requests', status, page],
    queryFn: () => adminApi.borrowRequests.list({ status, page }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.borrowRequests.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      setApprovingReq(null);
      showToast('Borrow request approved successfully.', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to approve request.', 'error');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.borrowRequests.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      setRejectTarget(null);
      showToast('Borrow request rejected.', 'info');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to reject request.', 'error');
    }
  });

  // Smart poll: check pending request count every 10 seconds, refetch list only if count changed
  const { data: notifData } = useQuery({
    queryKey: ['admin-requests-notifications-poll'],
    queryFn: () => adminApi.notifications(),
    refetchInterval: 10000,
  });

  // When pending request count changes, invalidate the requests query
  useEffect(() => {
    if (!notifData) return;
    const currentPending = notifData.pendingRequests;
    const prev = prevPendingRef.current;
    if (prev !== null && currentPending !== prev) {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    }
    prevPendingRef.current = currentPending;
  }, [notifData, queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Borrow Requests</h1>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {['Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Book</th>
                <th className="px-6 py-4 font-semibold">Return Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : requestsData?.data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No requests found.</td></tr>
              ) : requestsData?.data.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{req.user?.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{req.user?.student_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 line-clamp-1">{req.book?.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{req.book?.book_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 font-medium">
                      {req.return_date ? new Date(req.return_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setApprovingReq(req)}
                          disabled={approveMutation.isPending}
                          className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-lg transition disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget(req)}
                          disabled={rejectMutation.isPending}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requestsData && requestsData.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing page {requestsData.current_page} of {requestsData.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(requestsData.last_page, p + 1))} disabled={page === requestsData.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {approvingReq && (
        <ApproveModal
          req={approvingReq}
          onConfirm={() => approveMutation.mutate(approvingReq.id)}
          onCancel={() => setApprovingReq(null)}
          isLoading={approveMutation.isPending}
        />
      )}

      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Request"
        message={`Are you sure you want to reject ${rejectTarget?.user?.name ?? 'this student'}'s request for "${rejectTarget?.book?.title ?? 'this book'}"?`}
        variant="danger"
        confirmText="Reject"
        onConfirm={() => rejectTarget && rejectMutation.mutate(rejectTarget.id)}
        onCancel={() => setRejectTarget(null)}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}

function ApproveModal({ req, onConfirm, onCancel, isLoading }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Confirm Approval</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
            <p className="text-sm text-amber-800 font-medium">
              This will approve the request and send a QR code receipt to the student.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Student</p>
              <p className="font-bold text-gray-900">{req.user?.name}</p>
              <p className="text-xs text-gray-500 font-mono">{req.user?.student_id}</p>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-400 uppercase font-semibold">Book</p>
              <p className="font-bold text-gray-900">{req.book?.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">Author: {req.book?.author?.name || 'Unknown Author'} &bull; Publisher: {req.book?.publisher?.name || 'Unknown Publisher'}</p>
              {req.book?.year_of_book && <p className="text-xs text-gray-500">Year: {req.book.year_of_book}</p>}
              <p className="text-xs text-gray-500 font-mono mt-1">{req.book?.book_id}</p>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-400 uppercase font-semibold">Return Date</p>
              <p className="font-semibold text-gray-900">
                {req.return_date ? new Date(req.return_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
            {isLoading ? 'Approving...' : 'Confirm Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}