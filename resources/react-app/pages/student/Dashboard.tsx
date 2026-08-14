import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { booksApi } from '@/api/books';
import { studentApi } from '@/api/student';
import type { Book, BorrowRecord } from '@/types';
import type { SuggestionResult } from '@/api/books';
import BookDetailModal from '@/components/BookDetailModal';
import { formatCompact } from '@/utils/format';

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const isAvailable = book.status === 'Available' && book.available_copies > 0;
  const coverUrl = book.cover_image || null;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${book.is_recommended
        ? 'border-amber-300 ring-2 ring-amber-200'
        : 'border-gray-100'
        }`}
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {book.is_recommended && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">⭐ Recommended</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1.5 w-fit">
          {book.category.name}
        </span>
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{book.title}</h3>
        {book.year_of_book && <p className="text-xs text-gray-400">Year: {book.year_of_book}</p>}
        <p className="text-xs text-gray-400 truncate">By: {book.author.name}</p>


        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className={`text-[10px] font-semibold flex items-center gap-1 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            {isAvailable ? `${book.available_copies} Available` : 'Unavailable'}
          </span>
          <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            {formatCompact(book.total_borrows ?? 0)} Borrows
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search);

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books', debouncedSearch, category, page],
    queryFn: () =>
      booksApi.list({ search: debouncedSearch, category, page }).then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['book-categories'],
    queryFn: () => booksApi.categories().then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  });



  const { data: activeBorrows = [] } = useQuery({
    queryKey: ['active-borrows'],
    queryFn: () => studentApi.activeBorrows().then((r) => r.data),
    refetchInterval: 30_000, // refresh every 30s to update due/overdue status
  });

  const gracePeriodBanner = useMemo(() => {
    if (!activeBorrows.length || dismissBanner) return null;

    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Books more than 5 minutes past due → actually overdue (penalties apply)
    const overdueRecords = activeBorrows.filter(
      (r: BorrowRecord) => r.due_date && now > new Date(r.due_date) && fiveMinAgo > new Date(r.due_date)
    );

    // Books past due but within the 5-minute grace period
    const gracePeriodRecords = activeBorrows.filter(
      (r: BorrowRecord) =>
        r.due_date &&
        now.getTime() > new Date(r.due_date).getTime() &&
        now.getTime() <= new Date(r.due_date).getTime() + 5 * 60 * 1000
    );

    // Books due within the next 5 minutes
    const dueSoonRecords = activeBorrows.filter(
      (r: BorrowRecord) =>
        r.due_date &&
        now < new Date(r.due_date) &&
        new Date(r.due_date) < fiveMinFromNow
    );

    const claimRecords = activeBorrows.filter(
      (r: BorrowRecord) => r.status === 'Pending Claim'
    );

    // Determine banner type — most urgent first
    if (overdueRecords.length > 0) {
      return {
        variant: 'danger' as const,
        icon: '⛔',
        title: `${overdueRecords.length} book(s) overdue — penalties are now accruing`,
        message: `The 5-minute grace period has passed. A penalty is now being applied. Please return them immediately to avoid further charges.`,
      };
    }

    if (gracePeriodRecords.length > 0) {
      const minsPastDue = Math.ceil((now.getTime() - new Date(gracePeriodRecords[0].due_date!).getTime()) / 60000);
      const minsRemaining = Math.max(1, 5 - minsPastDue);
      return {
        variant: 'warning' as const,
        icon: '⏳',
        title: `${gracePeriodRecords.length} book(s) in grace period — return now to avoid penalties!`,
        message: `You are within the 5-minute grace period. Return within the next ${minsRemaining} minute(s) to avoid an automatic penalty.`,
      };
    }

    if (dueSoonRecords.length > 0) {
      return {
        variant: 'warning' as const,
        icon: '⚠️',
        title: `${dueSoonRecords.length} book(s) due within 5 minutes`,
        message: `Please return them on time. You have a 5-minute grace period after the due time before penalties are automatically applied.`,
      };
    }

    if (claimRecords.length > 0) {
      return {
        variant: 'info' as const,
        icon: '📚',
        title: `${claimRecords.length} book(s) awaiting claim at the counter`,
        message: `Visit the library counter to claim your book(s). Unclaimed books expire after 5 minutes and the reservation will be cancelled.`,
      };
    }

    return {
      variant: 'info' as const,
      icon: '📖',
      title: `You have ${activeBorrows.length} active borrow(s)`,
      message: `Remember: You have a 5-minute grace period after the due time to return books before penalties are automatically applied. Return on time to avoid late fees.`,
    };
  }, [activeBorrows, dismissBanner]);

  const { data: suggestionsData } = useQuery({
    queryKey: ['book-suggestions', search, category],
    queryFn: () =>
      booksApi.suggestions({ q: search, category }).then((r) => r.data),
    enabled: search.trim().length >= 2 || category.length > 0,
    staleTime: 1000 * 30,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCategory('');
    setPage(1);
  };

  const handleSuggestionClick = useCallback(async (suggestion: SuggestionResult) => {
    setShowSuggestions(false);
    try {
      const res = await booksApi.get(suggestion.id);
      setSelectedBook(res.data);
    } catch {
      setSearch(suggestion.label);
    }
  }, []);

  const handleCategorySuggestionClick = useCallback((slug: string) => {
    setCategory(slug);
    setSearch('');
    setPage(1);
    setShowSuggestions(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* 5-Minute Grace Period Banner */}
      {gracePeriodBanner && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 border shadow-sm animate-[bannerSlideUp_0.3s_ease-out] ${
          gracePeriodBanner.variant === 'danger'
            ? 'bg-red-50 border-red-200'
            : gracePeriodBanner.variant === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
            gracePeriodBanner.variant === 'danger'
              ? 'bg-red-100'
              : gracePeriodBanner.variant === 'warning'
              ? 'bg-amber-100'
              : 'bg-blue-100'
          }`}>
            {gracePeriodBanner.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${
              gracePeriodBanner.variant === 'danger'
                ? 'text-red-800'
                : gracePeriodBanner.variant === 'warning'
                ? 'text-amber-800'
                : 'text-blue-800'
            }`}>
              {gracePeriodBanner.title}
            </p>
            <p className={`text-xs mt-1 leading-relaxed ${
              gracePeriodBanner.variant === 'danger'
                ? 'text-red-600'
                : gracePeriodBanner.variant === 'warning'
                ? 'text-amber-600'
                : 'text-blue-600'
            }`}>
              {gracePeriodBanner.message}
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => navigate('/borrowed-books')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  gracePeriodBanner.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : gracePeriodBanner.variant === 'warning'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                View Borrowed Books
              </button>
              <button
                onClick={() => setDismissBanner(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  gracePeriodBanner.variant === 'danger'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : gracePeriodBanner.variant === 'warning'
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header & Search */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Browse Library
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-lg">
          Discover your next favorite book. Search our extensive collection of academic and fictional works.
        </p>

        <div className="w-full max-w-2xl mt-8 relative">
          <div className="relative group z-30">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or category…"
              value={search}
              onChange={handleSearch}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white text-sm text-gray-900 placeholder-gray-400 shadow-sm border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setShowSuggestions(false); setPage(1); }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {showSuggestions && suggestionsData && (suggestionsData.books.length > 0 || suggestionsData.categories?.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
              <ul className="max-h-80 overflow-y-auto py-2">
                {/* Category suggestions */}
                {suggestionsData.categories?.length > 0 && (
                  <>
                    <li className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</li>
                    {suggestionsData.categories.map((cat: any) => (
                      <li
                        key={'cat-' + cat.slug}
                        onMouseDown={(e) => { e.preventDefault(); handleCategorySuggestionClick(cat.slug); }}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900">{cat.name}</div>
                          <div className="text-xs text-gray-400">Browse all books in this category</div>
                        </div>
                      </li>
                    ))}
                  </>
                )}
                {/* Book suggestions */}
                {suggestionsData.books.length > 0 && (
                  <>
                    {suggestionsData.categories?.length > 0 && <li className="border-t border-gray-100 my-1" />}
                    <li className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Books</li>
                    {suggestionsData.books.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(suggestion); }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {suggestion.cover ? (
                          <img src={suggestion.cover} alt={suggestion.label} className="w-10 h-14 object-cover rounded-md shadow-sm shrink-0" />
                        ) : (
                          <div className="w-10 h-14 bg-gray-100 rounded-md shadow-sm flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 line-clamp-1">{suggestion.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{suggestion.author}</div>
                        </div>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          )}

          {showSuggestions && search.trim() !== '' && suggestionsData && suggestionsData.books.length === 0 && (!suggestionsData.categories || suggestionsData.categories.length === 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
              <div className="px-4 py-4 text-sm text-gray-500 text-center font-medium">No matching books found.</div>
            </div>
          )}
          
          {/* Category Chips Desktop View */}
          {categoriesData && categoriesData.length > 0 && (
            <div className="mt-5 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  !category 
                    ? 'bg-gray-900 text-white shadow-md hover:bg-gray-800' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                All Books
              </button>
              {categoriesData.map((cat: any) => (
                <button
                  key={cat.slug}
                  onClick={() => { setCategory(cat.slug); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    category === cat.slug 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Books */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded-full w-16" />
                <div className="h-4 bg-gray-100 rounded-full" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : booksData?.data.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-500">No books found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {booksData?.data.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
            ))}
          </div>

          {booksData && booksData.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition">← Previous</button>
              <span className="text-sm text-gray-500 px-2">Page {booksData.current_page} of {booksData.last_page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === booksData.last_page} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
            </div>
          )}
        </>
      )}

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}

      <style>{`
        @keyframes bannerSlideUp {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}