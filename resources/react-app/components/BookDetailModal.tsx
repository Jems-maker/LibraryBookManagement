import React, { useState, useRef, useEffect } from 'react';
import type { Book } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { studentApi } from '@/api/student';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  book: Book;
  onClose: () => void;
}

// ── Calendar Modal Date Picker ────────────────────────────────────────────────
function DatePickerModal({
  value,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: {
  value: string;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const initialDate = value ? new Date(value + 'T00:00:00') : minDate;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDateInRange = (d: Date) => {
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    return dateOnly >= min && dateOnly <= max;
  };

  const handleDayClick = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    onSelect(`${y}-${m}-${d}`);
    onClose();
  };

  const isSelectedDay = (day: number) => {
    if (!value) return false;
    const selected = new Date(value + 'T00:00:00');
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  };

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 p-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-sm font-bold text-gray-900">
            {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' })} {viewYear}
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first day offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(viewYear, viewMonth, day);
            const inRange = isDateInRange(dateObj);
            const isToday = day === todayDay && viewMonth === todayMonth && viewYear === todayYear;
            const selected = isSelectedDay(day);

            return (
              <button
                key={day}
                disabled={!inRange}
                onClick={() => handleDayClick(day)}
                className={`w-full aspect-square rounded-xl text-sm font-semibold transition-all active:scale-90 ${selected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : inRange
                    ? 'hover:bg-blue-50 text-gray-800'
                    : 'text-gray-300 cursor-not-allowed'
                  } ${isToday && !selected ? 'ring-2 ring-blue-200' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => { onSelect(''); onClose(); }}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition px-2 py-1"
          >
            Clear
          </button>
          <div className="text-[10px] text-gray-400">
            {minDate.toLocaleDateString()} – {maxDate.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Time Picker Modal ────────────────────────────────────────────────────────
function TimePickerModal({
  value,
  onSelect,
  onClose,
}: {
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
}) {
  // value is expected to be "HH:mm" (24-hour format)
  const initialDate = new Date();
  if (value) {
    const [h, m] = value.split(':');
    initialDate.setHours(parseInt(h, 10));
    initialDate.setMinutes(parseInt(m, 10));
  } else {
    // Default to next whole hour
    initialDate.setHours(initialDate.getHours() + 1);
    initialDate.setMinutes(0);
  }

  let initHour12 = initialDate.getHours() % 12 || 12;
  const [hour, setHour] = useState(initHour12);
  const [minute, setMinute] = useState(Math.floor(initialDate.getMinutes() / 5) * 5);
  const [isPM, setIsPM] = useState(initialDate.getHours() >= 12);

  const handleConfirm = () => {
    let h24 = hour;
    if (isPM && hour !== 12) h24 += 12;
    if (!isPM && hour === 12) h24 = 0;

    const hh = String(h24).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    onSelect(`${hh}:${mm}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 p-6 animate-scale-up">

        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Select Time</h3>
          <div className="text-3xl font-black text-blue-600 mt-2 tracking-tight">
            {hour}:{String(minute).padStart(2, '0')} {isPM ? 'PM' : 'AM'}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {/* Hours Column */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-2 h-48 overflow-y-auto hide-scrollbar border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase text-center mb-2">Hour</div>
            <div className="flex flex-col gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <button
                  key={h}
                  onClick={() => setHour(h)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${hour === h ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Column */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-2 h-48 overflow-y-auto hide-scrollbar border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase text-center mb-2">Minute</div>
            <div className="flex flex-col gap-1">
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinute(m)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${minute === m ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => setIsPM(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isPM ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            AM
          </button>
          <button
            onClick={() => setIsPM(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isPM ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            PM
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-700 transition active:scale-95">
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function BookDetailModal({ book, onClose }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const { mutate: borrowBook, isPending } = useMutation({
    mutationFn: () => studentApi.borrowBook(book.id, {
      return_date: returnDate,
      return_time: returnTime || '23:59',
      quantity,
    }),
    onSuccess: (res) => {
      setSuccess(res.data.message);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['active-borrows'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    },
  });

  const coverUrl = book.cover_image
    ? book.cover_image.startsWith('http')
      ? book.cover_image
      : `/storage/${book.cover_image}`
    : null;

  const isAvailable = book.status === 'Available' && book.available_copies > 0;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg z-10 max-h-[90vh] overflow-y-auto animate-slide-up">

        {/* Cover banner */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt={book.title} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Badges */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {book.category.name}
            </span>
            {book.is_recommended && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/90 text-white flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Recommended
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{book.title}</h2>
            <p className="text-gray-500 text-sm mt-1">by {book.author.name}</p>

            <div className="flex items-center gap-3 mt-3">
              {book.total_borrows !== undefined && book.total_borrows > 0 && (
                <>
                  <StarRating rating={book.is_recommended ? 5 : 4} />
                  <span className="text-xs text-gray-400">{book.total_borrows} borrows</span>
                </>
              )}
            </div>
          </div>

          {/* Meta grid — removed "Total" column */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Available</p>
              <p className={`text-lg font-bold mt-0.5 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {book.available_copies}
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Status</p>
              <p className={`text-xs font-bold mt-1 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{book.description}</p>
          )}

          {/* Book Details */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Book Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Book ID</span>
                <span className="text-gray-900 font-semibold">{book.book_id}</span>
              </div>
              {book.publisher && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Publisher</span>
                  <span className="text-gray-900 font-semibold">{book.publisher.name}</span>
                </div>
              )}
              {book.year_of_book && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Year</span>
                  <span className="text-gray-900 font-semibold">{book.year_of_book}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="text-gray-900 font-semibold">{book.category.name}</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Borrow form */}
          {isAvailable && !success && (
            <div className="space-y-3">
              {/* Quantity selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(book.available_copies, q + 1))}
                    disabled={quantity >= book.available_copies}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <span className="text-xs text-gray-400 ml-1">of {book.available_copies} available</span>
                </div>
              </div>
              {/* Return Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Return Date & Time</label>

                {/* Date picker trigger */}
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full flex items-center gap-3 rounded-2xl border text-sm px-4 py-3 outline-none transition bg-gray-50 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={returnDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {returnDate ? formatDisplayDate(returnDate) : 'Select a return date'}
                  </span>
                  {returnDate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setReturnDate(''); setReturnTime(''); }}
                      className="ml-auto w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                    >
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </button>

                {/* Time picker trigger */}
                {returnDate && (
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Return Time</label>
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(true)}
                      className="w-full flex items-center gap-3 rounded-2xl border text-sm px-4 py-3 outline-none transition bg-gray-50 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={returnTime ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {returnTime ? formatDisplayTime(returnTime) : 'Select a return time'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => borrowBook()}
                disabled={!returnDate || !returnTime || isPending}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                {isPending ? 'Submitting…' : 'Request to Borrow'}
              </button>
            </div>
          )}

          {!isAvailable && (
            <div className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold rounded-2xl text-center text-sm">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>

      {/* Calendar Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          value={returnDate}
          minDate={minDate}
          maxDate={maxDate}
          onSelect={(date) => {
            setReturnDate(date);
            if (!returnTime) setReturnTime('17:00'); // Default to 5 PM
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showTimePicker && (
        <TimePickerModal
          value={returnTime}
          onSelect={setReturnTime}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}