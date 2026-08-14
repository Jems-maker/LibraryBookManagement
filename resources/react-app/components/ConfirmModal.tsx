import React from 'react';

type ModalVariant = 'danger' | 'success' | 'warning' | 'info' | 'primary';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: ModalVariant;
  isLoading?: boolean;
  details?: { label: string; value: string; highlight?: boolean }[];
}

const variantStyles: Record<ModalVariant, {
  iconBg: string;
  iconText: string;
  icon: React.ReactNode;
  buttonBg: string;
  buttonHover: string;
  buttonRing: string;
}> = {
  danger: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
    buttonRing: 'ring-red-200',
  },
  success: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    buttonBg: 'bg-green-600',
    buttonHover: 'hover:bg-green-700',
    buttonRing: 'ring-green-200',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    buttonBg: 'bg-amber-600',
    buttonHover: 'hover:bg-amber-700',
    buttonRing: 'ring-amber-200',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    buttonRing: 'ring-blue-200',
  },
  primary: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    buttonRing: 'ring-blue-200',
  },
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
  details,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const c = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[modalSlideUp_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className={`w-14 h-14 ${c.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <div className={c.iconText}>{c.icon}</div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="mx-6 mb-4 bg-gray-50 rounded-2xl p-4 space-y-3">
            {details.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{d.label}</span>
                <span className={`font-bold ${d.highlight ? 'text-red-600' : 'text-gray-900'}`}>{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3">
          {cancelText && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-3 ${cancelText ? 'flex-1' : 'w-full'} ${c.buttonBg} ${c.buttonHover} text-white font-bold rounded-xl transition ring-4 ${c.buttonRing} disabled:opacity-70`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
