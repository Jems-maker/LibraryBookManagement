import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RequestsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const { data: activeBorrows } = useQuery({
    queryKey: ['active-borrows'],
    queryFn: () => studentApi.activeBorrows().then((r) => r.data),
    enabled: user?.role === 'student',
  });

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/profile', label: 'Profile', icon: <UserIcon /> },
    { to: '/dashboard', label: 'Browse Books', icon: <BookIcon /> },
    { to: '/requests', label: 'Requests', icon: <RequestsIcon /> },
    { to: '/history', label: 'History', icon: <HistoryIcon /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <img src="/images/LBMS.png" alt="LBMS" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
            </div>
            <span className="font-bold text-gray-900 text-sm">School Library</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {link.icon}
                {link.label}
                {link.to === '/profile' && activeBorrows && activeBorrows.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">{activeBorrows.length}</span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.student_id}</p>
              </div>
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&color=7F9CF5&background=EBF4FF&bold=true&size=80`}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full ring-2 ring-blue-100 object-cover"
                />
              </div>
              <button onClick={logout} className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors">Sign out</button>
            </div>

            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile menu — Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div 
            className="absolute right-0 top-0 h-screen w-[70%] max-w-[320px] bg-white shadow-2xl flex flex-col animate-[slideLeft_0.3s_ease-out]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg">Menu</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4">
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive(link.to)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {link.icon}
                    {link.label}
                    {link.to === '/profile' && activeBorrows && activeBorrows.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">{activeBorrows.length}</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&color=7F9CF5&background=EBF4FF&bold=true&size=80`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full ring-2 ring-blue-100 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="w-full py-2 bg-white border border-gray-200 rounded-xl text-sm text-red-600 font-bold hover:bg-red-50 hover:border-red-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}