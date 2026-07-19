import api from '@/api/client';
import type { BorrowRecord, BorrowRequest, PaginatedResponse, User } from '@/types';

export const studentApi = {
  // Profile
  profile: () => api.get<User>('/api/student/profile'),
  updateProfile: (data: Partial<User>) => api.patch('/api/student/profile', data),
  updateGender: (gender: string) => api.patch('/api/student/profile/gender', { gender }),

  // Borrow requests
  requests: () => api.get<BorrowRequest[]>('/api/student/requests'),
  borrowBook: (bookId: number, data: { return_date: string; return_time?: string; quantity?: number }) =>
    api.post<{ message: string }>(`/api/student/borrow/${bookId}`, data),

  // Borrowed books
  activeBorrows: () => api.get<BorrowRecord[]>('/api/student/borrowed-books'),
  history: (page = 1) =>
    api.get<PaginatedResponse<BorrowRecord>>('/api/student/history', {
      params: { page },
    }),
};
