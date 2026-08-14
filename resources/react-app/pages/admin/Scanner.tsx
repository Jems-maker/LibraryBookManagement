import React, { useLayoutEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

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
  const qrReaderWrapperRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // useLayoutEffect ensures cleanup runs before React unmounts the DOM
  useLayoutEffect(() => {
    const wrapper = qrReaderWrapperRef.current;
    if (!wrapper) return;

    let isMounted = true;

    // Create the container div imperatively — the library owns this element,
    // not React. React only owns the wrapper div.
    const container = document.createElement('div');
    container.id = 'qr-reader';
    container.className = 'w-full';
    wrapper.appendChild(container);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render((text) => {
      if (!isMounted) return;

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
      isMounted = false;
      scannerRef.current = null;

      try {
        scanner.clear()
          .then(() => {
            // Only remove the container AFTER the library has fully cleaned up
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          })
          .catch(() => {
            // Even if the library fails to clear, remove the container to avoid leaks
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          });
      } catch (e) {
        // Synchronous failure — remove the container immediately
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
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
      showToast(data.message, 'success');
    },
    onError: (err: any) => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setErrorMsg(err.response?.data?.message || 'Failed to process.');
      showToast(err.response?.data?.message || 'Failed to process.', 'error');
    }
  });

  const { showToast } = useToast();

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
    const gracePeriodMs = 5 * 60 * 1000;
    const isOverdue = now.getTime() > (dueDate.getTime() + gracePeriodMs) && record.status !== 'Returned';
    const isEarlyReturn = now < dueDate;
    const isDueDateReturn = !isEarlyReturn && !isOverdue;

    const dueDateStr = dueDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    const todayStr = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    if (action === 'return') {

      const hoursEarly = isEarlyReturn ? Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))) : 0;
      const daysEarly = isEarlyReturn ? Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      const minutesLate = isOverdue ? Math.max(1, Math.ceil((now.getTime() - dueDate.getTime()) / 60000)) : 0;
      const periodsLate = isOverdue ? Math.ceil(minutesLate / 1440) : 0;

      const penaltySettingAmount = lookupData?.settings?.penalty_amount ?? 10;
      const penaltyAmount = periodsLate * penaltySettingAmount;

      let message = '';
      let returnStatus = { label: 'On Time', color: 'bg-green-100 text-green-700' };

      if (isOverdue) {
        message = `This book is overdue. A penalty of ₱${penaltyAmount.toFixed(2)} will be applied for ${periodsLate} period(s) late.`;
        returnStatus = { label: 'Overdue', color: 'bg-red-100 text-red-700' };
      } else if (isEarlyReturn) {
        message = daysEarly >= 1
          ? `This book is being returned ${daysEarly} day(s) early. Are you sure you want to process this early return?`
          : `This book is being returned ${hoursEarly} hour(s) early. Are you sure you want to process this early return?`;
        returnStatus = { label: 'Early Return', color: 'bg-blue-100 text-blue-700' };
      } else if (isDueDateReturn) {
        message = 'This book is being returned on its due date. The student returned it within the grace period. Proceed with the return?';
        returnStatus = { label: 'Due Date', color: 'bg-amber-100 text-amber-700' };
      } else {
        message = 'This book is being returned on time. Proceed with the return?';
      }

      const details: { label: string; value: string; highlight?: boolean }[] = [
        { label: 'Book', value: record.book?.title || 'Unknown' },
        { label: 'Student', value: record.user?.name || 'Unknown' },
        { label: 'Status', value: returnStatus.label, highlight: isOverdue },
        { label: 'Due Date', value: dueDateStr, highlight: isOverdue },
        { label: 'Return Date', value: todayStr },
      ];

      if (isOverdue) {
        details.push({ label: 'Penalty', value: `₱${penaltyAmount.toFixed(2)}`, highlight: true });
      }

      if (isEarlyReturn) {
        details.push({ label: 'Time Early', value: daysEarly >= 1 ? `${daysEarly} day(s)` : `${hoursEarly} hour(s)` });
      }

      let title = 'Confirm Return';
      let confirmLabel = 'Confirm Return';
      let confirmColor: 'green' | 'blue' = 'green';

      if (isOverdue) {
        title = '⚠️ Overdue Return';
        confirmLabel = 'Return & Apply Penalty';
        confirmColor = 'green';
      } else if (isEarlyReturn) {
        title = 'Early Return';
        confirmLabel = 'Confirm Return';
        confirmColor = 'blue';
      } else if (isDueDateReturn) {
        title = '📅 Due Date Return';
        confirmLabel = 'Confirm Return';
        confirmColor = 'blue';
      }

      setConfirmModal({
        isOpen: true,
        action: 'return',
        title,
        message,
        details,
        confirmLabel,
        confirmColor,
      });
    } else if (action === 'claim') {
      setConfirmModal({
        isOpen: true,
        action: 'claim',
        title: 'Confirm Claim',
        message: `Confirm that the student is picking up this book?`,
        details: [
          { label: 'Book', value: record.book?.title || 'Unknown' },
          { label: 'Author', value: record.book?.author?.name || 'Unknown' },
          { label: 'Publisher', value: record.book?.publisher?.name || 'Unknown' },
          { label: 'Year', value: record.book?.year_of_book ? String(record.book.year_of_book) : '—' },
          { label: 'Student', value: record.user?.name || 'Unknown' },
          { label: 'Student ID', value: record.user?.student_id || '—' },
          { label: 'Course', value: record.user?.profile?.course_description || record.user?.profile?.course || record.user?.student_profile?.course || record.user?.studentProfile?.course || '—' },
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
  const isExpired = record?.status === 'Expired';

  // Show expired feedback modal when an expired record is scanned
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);

  React.useEffect(() => {
    if (isExpired && scanResult) {
      setExpiredModalOpen(true);
    } else {
      setExpiredModalOpen(false);
    }
  }, [isExpired, scanResult]);

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
            <div ref={qrReaderWrapperRef} className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-200"></div>
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
                  <p className="text-sm text-gray-500 mt-1">{record.book?.author?.name || 'Unknown Author'} &bull; {record.book?.publisher?.name || 'Unknown Publisher'}</p>
                  {record.book?.year_of_book && <p className="text-xs text-gray-400 mt-1">Year: {record.book.year_of_book}</p>}
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
                    {new Date(record.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
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

      {/* Expired Record Feedback Modal */}
      <ConfirmModal
        isOpen={expiredModalOpen}
        title="⚠️ Receipt Expired"
        message="This borrow receipt has expired because the student did not claim the book within the allotted time (5 minutes). The reservation has been automatically cancelled and the book is now available for others."
        confirmText="Got it"
        cancelText=""
        variant="warning"
        details={record && expiredModalOpen ? [
          { label: 'Book', value: record.book?.title || 'Unknown' },
          { label: 'Student', value: record.user?.name || 'Unknown' },
          { label: 'Student ID', value: record.user?.student_id || '—' },
          { label: 'Status', value: 'Expired', highlight: true },
          { label: 'Original Due Date', value: new Date(record.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) },
        ] : []}
        onConfirm={() => {
          setExpiredModalOpen(false);
          resetScanner();
        }}
        onCancel={() => {
          setExpiredModalOpen(false);
          resetScanner();
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        confirmText={confirmModal.confirmLabel}
        variant={confirmModal.confirmColor === 'green' ? 'success' : 'primary'}
        isLoading={processMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}