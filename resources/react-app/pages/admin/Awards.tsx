import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export default function Awards() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['admin-awards'],
    queryFn: () => adminApi.awards.list().then(r => r.data)
  });

  return (
    <div className="space-y-6 max-w-8xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Awards & Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">Top readers based on reward points</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold w-16 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Points</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading leaderboard...</td></tr>
              ) : students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {index === 0 ? <span className="text-2xl">🥇</span> :
                        index === 1 ? <span className="text-2xl">🥈</span> :
                          index === 2 ? <span className="text-2xl">🥉</span> :
                            <span className="font-bold text-gray-400">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-400">{student.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 font-bold rounded-lg border border-amber-200">
                      ⭐ {student.total_points ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/api/admin/awards/${student.id}/download`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Certificate
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}