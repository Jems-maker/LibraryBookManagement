import React, { useLayoutEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: { label: string; value: string; highlight?: boolean }[];
  confirmLabel: string;
  confirmColor: 'green' | 'blue';
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ isOpen, title, message, details, confirmLabel, confirmColor, isLoading, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  const colorMap = {
    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', ring: 'ring-green-200', iconBg: 'bg-green-100', iconText: 'text-green-600' },
    blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'ring-blue-200', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  };
  const c = colorMap[confirmColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[modalSlideUp_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className={`w-14 h-14 ${c.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            {confirmColor === 'green' ? (
              <svg className={`w-7 h-7 ${c.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className={`w-7 h-7 ${c.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
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
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 ${c.bg} ${c.hover} text-white font-bold rounded-xl transition ring-4 ${c.ring} disabled:opacity-70`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function Scanner() {
  const queryClient = useQueryClient();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'claim' | 'return';
    title: string;
    message: string;
    details: { label: string; value: string; highlight?: boolean }[];
    confirmLabel: string;
    confirmColor: 'green' | 'blue';
  }>({
    isOpen: false,
    action: 'return',
    title: '',
    message: '',
    details: [],
    confirmLabel: '',
    confirmColor: 'green',
  });

  const lastScanned = useRef<string | null>(null);

  // useLayoutEffect ensures cleanup runs before React unmounts the DOM
  useLayoutEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      /* verbose= */ false
    );

    scanner.render((text) => {
      if (lastScanned.current !== text) {
        lastScanned.current = text;

        // Extract borrow_id from URL if the QR encodes a full URL
        let extractedId = text;
        try {
          const url = new URL(text);
          const params = new URLSearchParams(url.search);
          if (params.has('borrow_id')) extractedId = params.get('borrow_id')!;
        } catch (e) { }

        setScanResult(extractedId);
      }
    }, () => { });

    return () => {
      try {
        scanner.clear().catch(() => { });
      } catch (e) {
        // Ignore DOM lifecycle errors
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId) return;
    setScanResult(manualId);
    lastScanned.current = manualId;
  };

  const { data: lookupData, isFetching: isLookingUp, error: lookupError } = useQuery({
    queryKey: ['scanner-lookup', scanResult],
    queryFn: () => adminApi.scanner.lookup(scanResult!).then(r => r.data),
    enabled: !!scanResult,
    retry: false,
  });

  const processMutation = useMutation({
    mutationFn: (action: 'claim' | 'return') => adminApi.scanner.process(scanResult!, action).then(r => r.data),
    onSuccess: (data) => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      queryClient.invalidateQueries({ queryKey: ['scanner-lookup'] });
      setSuccessMsg(data.message);
      setScanResult(null);
      lastScanned.current = null;
    },
    onError: (err: any) => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setErrorMsg(err.response?.data?.message || 'Failed to process.');
    }
  });

  const resetScanner = () => {
    setScanResult(null);
    lastScanned.current = null;
    setSuccessMsg('');
    setErrorMsg('');
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const openConfirmModal = (action: 'claim' | 'return') => {
    if (!record) return;

    const now = new Date();
    const dueDate = new Date(record.due_date);
    const isOverdue = now > dueDate && record.status !== 'Returned';
    const isEarlyReturn = now < dueDate;

    const dueDateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (action === 'return') {
      const daysEarly = isEarlyReturn ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const daysLate = isOverdue ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      let message = '';
      if (isOverdue) {
        message = `This book is overdue by ${daysLate} day(s). A penalty of ₱${daysLate * 5}.00 will be applied.`;
      } else if (isEarlyReturn) {
        message = `This book is being returned ${daysEarly} day(s) before the due date. Are you sure you want to process this early return?`;
      } else {
        message = 'This book is being returned on time. Proceed with the return?';
      }

      const details: { label: string; value: string; highlight?: boolean }[] = [
        { label: 'Book', value: record.book?.title || 'Unknown' },
        { label: 'Student', value: record.user?.name || 'Unknown' },
        { label: 'Due Date', value: dueDateStr, highlight: isOverdue },
        { label: 'Return Date', value: todayStr },
      ];

      if (isOverdue) {
        details.push({ label: 'Penalty', value: `₱${daysLate * 5}.00`, highlight: true });
      }

      if (isEarlyReturn) {
        details.push({ label: 'Days Early', value: `${daysEarly} day(s)` });
      }

      setConfirmModal({
        isOpen: true,
        action: 'return',
        title: isOverdue ? '⚠️ Overdue Return' : isEarlyReturn ? 'Early Return' : 'Confirm Return',
        message,
        details,
        confirmLabel: isOverdue ? 'Return & Apply Penalty' : 'Confirm Return',
        confirmColor: 'green',
      });
    } else if (action === 'claim') {
      setConfirmModal({
        isOpen: true,
        action: 'claim',
        title: 'Confirm Claim',
        message: `Confirm that the student is picking up this book?`,
        details: [
          { label: 'Book', value: record.book?.title || 'Unknown' },
          { label: 'Student', value: record.user?.name || 'Unknown' },
          { label: 'Due Date', value: dueDateStr },
        ],
        confirmLabel: 'Confirm Claim',
        confirmColor: 'blue',
      });
    }
  };

  const handleConfirm = () => {
    processMutation.mutate(confirmModal.action);
  };

  const record = lookupData?.record;

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center justify-between">
          <p className="font-bold">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between">
          <p className="font-bold">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {lookupError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between">
          <p className="font-bold">{(lookupError as any).response?.data?.error || 'Invalid QR Code or Record Not Found.'}</p>
          <button onClick={resetScanner} className="text-red-500 hover:text-red-700 font-bold">Clear</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Scan QR Code</h2>
            <div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
              <div id="qr-reader" className="w-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Manual Entry</h2>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Borrow ID (e.g. BRW-XYZ)"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800">Lookup</button>
            </form>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Record Details</h2>

          {isLookingUp ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">Looking up record...</div>
          ) : !scanResult ? (
            <div className="text-center py-20 text-gray-400 font-medium">Scan a QR code to view details</div>
          ) : record ? (
            <div className="space-y-6">

              <div className="flex gap-4">
                <div className="w-20 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {record.book?.cover_image && <img src={record.book.cover_image} alt="Cover" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${record.status === 'Pending Claim' ? 'bg-blue-100 text-blue-700' :
                    record.status === 'Borrowed' ? 'bg-green-100 text-green-700' :
                      record.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>{record.status}</span>
                  <h3 className="font-bold text-gray-900 mt-2 text-lg leading-tight">{record.book?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{record.book?.author?.name}</p>
                  <p className="text-xs font-mono text-gray-400 mt-2">ID: {record.borrow_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Student</p>
                  <p className="font-bold text-gray-900">{record.user?.name}</p>
                  <p className="text-xs text-gray-500">{record.user?.student_id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Due Date</p>
                  <p className={`font-bold ${new Date() > new Date(record.due_date) && record.status !== 'Returned' ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(record.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions based on record status */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {record.status === 'Pending Claim' && (
                  <button
                    onClick={() => openConfirmModal('claim')}
                    disabled={processMutation.isPending}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                  >
                    Process Claim
                  </button>
                )}
                {(record.status === 'Borrowed' || record.status === 'Overdue') && (
                  <button
                    onClick={() => openConfirmModal('return')}
                    disabled={processMutation.isPending}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition"
                  >
                    Process Return
                  </button>
                )}
                <button
                  onClick={resetScanner}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 font-medium">Record not found.</div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
        isLoading={processMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}