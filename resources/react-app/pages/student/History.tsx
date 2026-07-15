import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import { format, parseISO } from 'date-fns';

export default function History() {
  const [page, setPage] = useState(1);
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['history', page],
    queryFn: () => studentApi.history(page).then((r) => r.data),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Borrowing History</h1>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : !historyData || historyData.data.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="font-semibold text-gray-500 mb-1">No history</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {historyData.data.map((record) => (
                <div key={record.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 truncate">{record.book?.title}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-500">Borrowed: {record.borrow_date ? format(parseISO(record.borrow_date), 'MMM d, yyyy') : '—'}</span>
                      <span className="text-xs text-gray-500">Returned: {record.return_date ? format(parseISO(record.return_date), 'MMM d, yyyy') : '—'}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${record.status === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {historyData.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 px-2">Page {historyData.current_page} of {historyData.last_page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === historyData.last_page}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
