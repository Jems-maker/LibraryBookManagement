import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import type { BorrowRecord } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

function StatusBadge({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  if (isOverdue) return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-xl">Overdue</span>;
  if (status === 'Pending Claim') return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-xl">Pending Claim</span>;
  return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-xl">Borrowed</span>;
}

function BorrowCard({ record }: { record: BorrowRecord }) {
  const now = new Date();
  const dueDate = record.due_date ? parseISO(record.due_date) : null;
  const borrowDate = record.borrow_date ? parseISO(record.borrow_date) : null;
  const isOverdue = !!dueDate && now > dueDate;
  const daysLeft = dueDate ? differenceInDays(dueDate, now) : null;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
      <div className={`h-1 ${isOverdue ? 'bg-red-500' : record.status === 'Pending Claim' ? 'bg-blue-500' : 'bg-green-500'}`} />
      <div className="flex gap-4 p-5">
        <div className="w-16 h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm" style={{ height: 88 }}>
          {record.book?.cover_image ? (
            <img src={record.book.cover_image} alt={record.book?.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-400">No cover</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{record.book?.title ?? 'Unknown Book'}</p>
              <p className="text-sm text-gray-400 mt-0.5">{record.book?.author?.name ?? '—'}</p>
            </div>
            <StatusBadge status={record.status} isOverdue={isOverdue} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Borrow ID</p>
              <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">{record.borrow_id}</p>
            </div>
            {borrowDate && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Borrowed On</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{format(borrowDate, 'MMM d, yyyy \'at\' h:mm a')}</p>
              </div>
            )}
            {dueDate && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Due Date</p>
                <p className={`text-xs font-semibold mt-0.5 ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                  {format(dueDate, 'MMM d, yyyy')}
                  {isOverdue && <span className="ml-1 text-[10px]">({Math.abs(daysLeft ?? 0)}d overdue)</span>}
                  {!isOverdue && daysLeft !== null && <span className="ml-1 text-[10px] text-gray-400">({daysLeft}d left)</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BorrowedBooks() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['active-borrows'],
    queryFn: () => studentApi.activeBorrows().then((r) => r.data),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Borrowed Books</h1>
          <p className="text-gray-500 text-sm mt-1">Active and pending claim books</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">
          Browse More
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="font-semibold text-gray-500 mb-1">No active borrows</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => <BorrowCard key={record.id} record={record} />)}
        </div>
      )}
    </div>
  );
}
