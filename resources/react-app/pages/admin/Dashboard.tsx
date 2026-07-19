import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* Color palette for cards */
const CARD_STYLES = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500', label: 'text-blue-700' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-500', label: 'text-violet-700' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500', label: 'text-emerald-700' },
  { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500', label: 'text-red-700' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500', label: 'text-amber-700' },
];

const STAT_ICONS = [
  <svg key="books" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  <svg key="students" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  <svg key="borrowed" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="overdue" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  <svg key="pending" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
];

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

function StaticCard({ title, value, icon, idx }: { title: string; value: string | number; icon: React.ReactNode; idx: number }) {
  const s = CARD_STYLES[idx % CARD_STYLES.length];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.light}`}>
        <span className={s.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-0.5 ${s.text}`}>{value}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* Active Borrow Detail Modal */
function BorrowDetailModal({ record, onClose }: { record: any; onClose: () => void }) {
  if (!record) return null;

  const isOverdue = record.due_date && new Date(record.due_date) < new Date(Date.now() - 20 * 60 * 1000);
  const formatDate = (d: string) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A';

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Active Borrow Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-6 space-y-4">

          {/* Student Info */}
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Student</p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.user?.name ?? '')}&color=7F9CF5&background=EBF4FF&bold=true&size=80`}
                alt={record.user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-bold text-gray-900">{record.user?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 font-mono">{record.user?.student_id || record.user?.email || ''}</p>
                <p className="text-xs text-gray-500 mt-0.5">{record.user?.profile?.course || record.user?.studentProfile?.course || ''}</p>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Book</p>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <p className="font-bold text-gray-900">{record.book?.title || 'N/A'}</p>
              <p className="text-xs text-gray-500">by {record.book?.author?.name || 'Unknown Author'}</p>
              {record.book?.year_of_book && <p className="text-xs text-gray-400">{record.book.year_of_book}</p>}
              <p className="text-xs text-gray-500 font-mono">{record.book?.book_id || ''}</p>
            </div>
          </div>

          {/* Borrow Details */}
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Borrow Details</p>
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Borrow ID</span>
                <span className="text-sm font-bold text-gray-900 font-mono">{record.borrow_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Borrow Date</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(record.borrow_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Due Date</span>
                <span className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>{formatDate(record.due_date)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                <span className="text-sm text-gray-500">Status</span>
                {isOverdue ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    ⚠️ OVERDUE
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const queryClient = useQueryClient();

  // Track previous notification counts so we only refetch when something changes
  const prevNotifsRef = useRef<{ pendingRequests: number; overdueBooks: number } | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats', period],
    queryFn: () => adminApi.stats({ period }).then(r => r.data)
  });

  const { data: activeBorrowsRes } = useQuery({
    queryKey: ['admin-active-borrows'],
    queryFn: () => adminApi.borrowRecords.list({ status: 'borrowed' }).then(r => r.data)
  });

  // Smart poll: check notifications every 30 seconds, refetch stats only if counts changed
  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications-poll'],
    queryFn: () => adminApi.notifications(),
    refetchInterval: 30000,
  });

  // When notification counts change, invalidate the main stats query
  useEffect(() => {
    if (!notifData) return;
    const current = { pendingRequests: notifData.pendingRequests, overdueBooks: notifData.overdueBooks };
    const prev = prevNotifsRef.current;
    if (prev !== null) {
      if (current.pendingRequests !== prev.pendingRequests || current.overdueBooks !== prev.overdueBooks) {
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      }
    }
    prevNotifsRef.current = current;
  }, [notifData, queryClient]);

  if (isLoading) return <div className="text-center py-20 text-gray-400 font-medium">Loading Dashboard...</div>;
  if (!data) return null;

  const chartData = data.labels.map((label: string, i: number) => ({
    name: label,
    Borrows: Number(data.borrowArr[i] ?? 0),
    Returns: Number(data.returnArr[i] ?? 0),
  }));

  const pieData = (data.categoryStats ?? []).map((c: any) => ({
    name: c.name,
    value: Number(c.total),
  }));

  const stats = [
    { title: 'Total Books', value: data.totalBooks },
    { title: 'Students', value: data.totalStudents },
    { title: 'Borrowed Books', value: data.borrowedBooks },
    { title: 'Overdue', value: data.overdueBooks },
    { title: 'Pending Requests', value: data.pendingRequests },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          {getGreeting()}, Admin <span className="text-3xl origin-bottom-right hover:animate-spin">👋</span>
        </h1>

      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((s, i) => (
          <StaticCard key={s.title} title={s.title} value={s.value} icon={STAT_ICONS[i]} idx={i} />
        ))}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart — Borrow / Return activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Borrow & Return Activity</h2>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${period === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${period === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Borrows" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                <Line type="monotone" dataKey="Returns" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart — Categories */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Borrows by Category</h2>
          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) => <span className="text-gray-600 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories (Bars) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Top Categories (Borrows)</h2>
          <div className="space-y-4">
            {data.categoryStats.map((cat: any, i: number) => {
              const maxVal = Math.max(1, data.categoryStats[0]?.total ?? 1);
              const pct = Math.min(100, (cat.total / maxVal) * 100);
              const barColor = PIE_COLORS[i % PIE_COLORS.length];
              return (
                <div key={i} className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: barColor + '22', color: barColor }}>
                    {i + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900">{cat.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {data.categoryStats.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
          </div>
        </div>

        {/* Active Borrowers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Active Borrowers</h2>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
              {activeBorrowsRes?.total || 0} Total
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {activeBorrowsRes?.data?.slice(0, 5).map((record: any) => {
              const isOverdue = record.due_date && new Date(record.due_date) < new Date(Date.now() - 20 * 60 * 1000);
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.user?.name ?? '')}&color=7F9CF5&background=EBF4FF&bold=true&size=80`}
                      alt={record.user?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{record.user?.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-[150px] sm:max-w-[200px]" title={record.book?.title}>{record.book?.title}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {isOverdue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {(!activeBorrowsRes?.data || activeBorrowsRes.data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-sm font-medium">No active borrowers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Active Borrow Detail Modal */}
      {selectedRecord && (
        <BorrowDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}