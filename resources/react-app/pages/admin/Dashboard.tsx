import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* ── Color palette for cards ───────────────────────────────────────────── */
const CARD_STYLES = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500', label: 'text-blue-700' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-500', label: 'text-violet-700' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500', label: 'text-emerald-700' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500', label: 'text-amber-700' },
];

const STAT_ICONS = [
  <svg key="books" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  <svg key="students" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  <svg key="borrowed" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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

export default function Dashboard() {
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats', period],
    queryFn: () => adminApi.stats({ period }).then(r => r.data)
  });

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
    { title: 'Pending Requests', value: data.pendingRequests },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-md text-white">
          <h2 className="text-base font-bold mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/scanner" className="bg-white/10 hover:bg-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors text-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              <span className="font-semibold text-sm">QR Scanner</span>
            </a>
            <a href="/admin/requests" className="bg-white/10 hover:bg-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors text-center relative">
              {data.pendingRequests > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              <span className="font-semibold text-sm">View Requests</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}