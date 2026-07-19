import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { studentApi } from '@/api/student';
import type { BorrowRecord } from '@/types';
import { Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';

function StatusBadge({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  if (isOverdue) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg">Overdue</span>;
  if (status === 'Pending Claim') return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg">Pending</span>;
  return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg">Borrowed</span>;
}

function BorrowRow({ record }: { record: BorrowRecord }) {
  const dueDate = record.due_date ? parseISO(record.due_date) : null;
  const borrowDate = record.borrow_date ? parseISO(record.borrow_date) : null;
  const now = new Date();
  const isOverdue = !!dueDate && now > dueDate && record.status !== 'Returned';
  const daysLeft = dueDate ? differenceInDays(dueDate, now) : null;
  const coverUrl = record.book?.cover_image || null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {coverUrl ? (
          <img src={coverUrl} alt={record.book?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{record.book?.title ?? 'Unknown'}</p>
        <p className="text-xs text-gray-400 truncate">{record.book?.author?.name ?? '—'}</p>
        {record.book?.year_of_book && <p className="text-[10px] text-gray-400">{record.book.year_of_book}</p>}
        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
          <StatusBadge status={record.status} isOverdue={isOverdue} />
          {borrowDate && (
            <span className="text-[10px] text-gray-400">
              Borrowed {format(borrowDate, 'MMM d, yyyy \'at\' h:mm a')}
            </span>
          )}
          {dueDate && (
            <>
              <span className="text-[10px] text-gray-300">•</span>
              <span className={`text-[10px] font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                {isOverdue
                  ? `${Math.abs(daysLeft ?? 0)}d overdue · Due ${format(dueDate, 'MMM d')}`
                  : daysLeft === 0
                    ? 'Due today'
                    : `${daysLeft}d left · Due ${format(dueDate, 'MMM d')}`}
              </span>
            </>
          )}
        </div>
      </div>
      <p className="text-[10px] font-mono text-gray-300 shrink-0 hidden sm:block">{record.borrow_id}</p>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [gender, setGender] = useState(user?.profile?.gender ?? '');
  const [genderSuccess, setGenderSuccess] = useState(false);
  const [genderError, setGenderError] = useState('');
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => studentApi.profile().then((r) => r.data),
  });

  const { data: activeBorrows = [] } = useQuery({
    queryKey: ['active-borrows'],
    queryFn: () => studentApi.activeBorrows().then((r) => r.data),
  });

  const { data: historyData } = useQuery({
    queryKey: ['history', 1],
    queryFn: () => studentApi.history(1).then((r) => r.data),
  });

  const { mutate: updateGender, isPending } = useMutation({
    mutationFn: (g: string) => studentApi.updateGender(g),
    onSuccess: () => {
      setGenderSuccess(true);
      setGenderError('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setGenderSuccess(false), 3000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update gender.';
      setGenderError(msg);
      setTimeout(() => setGenderError(''), 3000);
    },
  });

  const totalPoints = profile?.total_points ?? 0;
  const initials = (profile?.name ?? 'S').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // Determine if gender can be shown/set
  const existingGender = profile?.profile?.gender || user?.profile?.gender;
  const genderEditable = !existingGender;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        <div className="px-6 pb-6">
          {/* Avatar - overlap */}
          <div className="flex justify-center -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-lg">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
          </div>

          {/* Name & Email */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
          </div>

          {/* Points */}
          {totalPoints > 0 && (
            <div className="flex justify-center mt-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                <svg className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-amber-700">{totalPoints} Points</span>
              </div>
            </div>
          )}

          {/* Stats — minimal inline */}
          <div className="flex justify-center gap-6 mt-5 text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Student ID</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{profile?.student_id ?? '—'}</p>
            </div>
            <div className="w-px bg-gray-200 self-stretch" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Course</p>
              <p className="text-sm font-bold text-gray-900 mt-1 break-words max-w-[120px]">{profile?.profile?.course || '—'}</p>
            </div>
            <div className="w-px bg-gray-200 self-stretch" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Gender</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{existingGender || '—'}</p>
            </div>
          </div>

          {/* Gender Selector — only show if not set yet */}
          {genderEditable && (
            <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-2">Set your gender (one-time only)</p>
              <div className="flex items-center gap-2">
                <select
                  value={gender}
                  onChange={(e) => { setGender(e.target.value); setGenderError(''); }}
                  className="flex-1 text-sm rounded-xl border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <button
                  onClick={() => gender && updateGender(gender)}
                  disabled={!gender || isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition-colors shrink-0"
                >
                  {isPending ? '...' : 'Save'}
                </button>
              </div>
              {genderSuccess && <p className="text-xs text-green-600 font-medium mt-2">✓ Gender saved</p>}
              {genderError && <p className="text-xs text-red-600 font-medium mt-2">{genderError}</p>}
            </div>
          )}

        </div>
      </div>

      {/* Active Borrows */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">Active Borrows</span>
            {activeBorrows.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {activeBorrows.length}
              </span>
            )}
          </div>
          <Link to="/borrowed-books" className="text-xs text-blue-500 font-semibold hover:text-blue-700">View all</Link>
        </div>

        {activeBorrows.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm font-medium">No active borrows</p>
            <Link to="/dashboard" className="inline-flex mt-3 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeBorrows.slice(0, 3).map((r) => (
              <BorrowRow key={r.id} record={r} />
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {historyData && historyData.data.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">History</span>
            <Link to="/history" className="text-xs text-blue-500 font-semibold hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 p-4 space-y-2">
            {historyData.data.filter((r) => r.status === 'Returned').slice(0, 5).map((r) => {
              const coverUrl = r.book?.cover_image || null;
              return (
                <div key={r.id} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {coverUrl ? (
                      <img src={coverUrl} alt={r.book?.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.book?.title}</p>
                    <p className="text-xs text-gray-400">
                      Returned {r.return_date ? format(parseISO(r.return_date), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg shrink-0">Returned</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}