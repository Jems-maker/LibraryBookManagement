import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const variantStyles: Record<ToastVariant, {
  bg: string;
  border: string;
  icon: React.ReactNode;
  iconColor: string;
  progressColor: string;
}> = {
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    iconColor: 'text-amber-500',
    progressColor: 'bg-amber-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
  },
};

function ToastItemComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const { message, variant, duration = 4000, id } = toast;
  const s = variantStyles[variant];
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    const timer = setTimeout(() => onRemove(id), duration);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [id, duration, onRemove]);

  return (
    <div
      className={`${s.bg} ${s.border} border rounded-2xl shadow-xl overflow-hidden animate-[toastSlideIn_0.4s_cubic-bezier(0.16,1,0.3,1)]`}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.iconColor} bg-opacity-10`}
          style={{ backgroundColor: 'currentColor' }}
        >
          <div className="text-white">{s.icon}</div>
        </div>
        <p className="text-sm font-semibold text-gray-800 flex-1 pt-0.5">{message}</p>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-1 bg-gray-100 mx-3 mb-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${s.progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItemComponent toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
