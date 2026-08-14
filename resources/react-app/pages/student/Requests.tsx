import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import type { BorrowRequest } from '@/types';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved') return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-xl">Approved</span>;
  if (status === 'Rejected') return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-xl">Rejected</span>;
  return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-xl">Pending</span>;
}

function RequestCard({ request }: { request: BorrowRequest }) {
  const returnDate = request.return_date ? parseISO(request.return_date) : null;
  const createdDate = request.created_at ? parseISO(request.created_at) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className={`h-1 ${request.status === 'Approved' ? 'bg-green-500' : request.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
      <div className="flex gap-4 p-5">
        <div className="w-16 h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm" style={{ height: 88 }}>
          {request.book?.cover_image ? (
            <img src={request.book.cover_image} alt={request.book?.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-400">No cover</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{request.book?.title ?? 'Unknown Book'}</p>
              <p className="text-sm text-gray-400 mt-0.5">Author: {request.book?.author?.name ?? '—'}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {createdDate && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Requested On</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{format(createdDate, 'MMM d, yyyy \'at\' h:mm a')}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Requested Return</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {returnDate ? format(returnDate, "MMM d, yyyy 'at' h:mm a") : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Requests() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['student-requests'],
    queryFn: () => studentApi.requests().then((r) => r.data),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Pending and recent borrow requests</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">
          Browse Books
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="font-semibold text-gray-500 mb-1">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => <RequestCard key={req.id} request={req} />)}
        </div>
      )}
    </div>
  );
}
