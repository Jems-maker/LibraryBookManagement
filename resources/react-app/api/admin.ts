import api from '@/api/client';
import type { PaginatedResponse, Book, User, BorrowRequest, BorrowRecord, Category, Author, Publisher } from '@/types';

export const adminApi = {
  // Dashboard
  stats: (params?: any) => api.get('/api/admin/stats', { params }),
  notifications: () => api.get('/api/admin/notifications').then(res => res.data),

  // Books
  books: {
    list: (params: any) => api.get<PaginatedResponse<Book>>('/api/admin/books', { params }),
    create: (data: any) => api.post('/api/admin/books', data),
    update: (id: number, data: any) => {
      // Laravel needs _method=PUT for multipart/form-data updates
      if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/api/admin/books/${id}`, data);
      }
      return api.put(`/api/admin/books/${id}`, data);
    },
    delete: (id: number) => api.delete(`/api/admin/books/${id}`),
  },

  // Categories, Authors, Publishers
  categories: {
    list: (params?: any) => api.get<PaginatedResponse<Category>>('/api/admin/categories', { params }),
    all: () => api.get<Category[]>('/api/admin/categories', { params: { all: 1 } }).then(res => res.data),
    create: (data: any) => api.post('/api/admin/categories', data),
    update: (id: number, data: any) => api.put(`/api/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
  },

  authors: {
    list: (params?: any) => api.get<PaginatedResponse<Author>>('/api/admin/authors', { params }),
    all: () => api.get<Author[]>('/api/admin/authors', { params: { all: 1 } }).then(res => res.data),
    create: (data: any) => api.post('/api/admin/authors', data),
    update: (id: number, data: any) => api.put(`/api/admin/authors/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/authors/${id}`),
  },

  publishers: {
    list: (params?: any) => api.get<PaginatedResponse<Publisher>>('/api/admin/publishers', { params }),
    all: () => api.get<Publisher[]>('/api/admin/publishers', { params: { all: 1 } }).then(res => res.data),
    create: (data: any) => api.post('/api/admin/publishers', data),
    update: (id: number, data: any) => api.put(`/api/admin/publishers/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/publishers/${id}`),
  },

  // Students
  students: {
    list: (params: any) => api.get<PaginatedResponse<User>>('/api/admin/students', { params }),
    create: (data: any) => api.post('/api/admin/students', data),
    update: (id: number, data: any) => api.put(`/api/admin/students/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/students/${id}`),
  },

  // Courses
  courses: {
    list: (params?: any) => api.get<PaginatedResponse<any>>('/api/admin/courses', { params }),
    all: () => api.get<any[]>('/api/admin/courses', { params: { all: 1 } }).then(res => res.data),
    create: (data: any) => api.post('/api/admin/courses', data),
    update: (id: number, data: any) => api.put(`/api/admin/courses/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/courses/${id}`),
  },

  // Borrow Requests
  borrowRequests: {
    list: (params: any) => api.get<PaginatedResponse<BorrowRequest>>('/api/admin/borrow-requests', { params }),
    approve: (id: number) => api.post(`/api/admin/borrow-requests/${id}/approve`),
    reject: (id: number) => api.post(`/api/admin/borrow-requests/${id}/reject`),
  },

  // Borrow Records
  borrowRecords: {
    list: (params: any) => api.get<PaginatedResponse<BorrowRecord>>('/api/admin/borrow-records', { params }),
  },

  // Scanner
  scanner: {
    lookup: (borrow_id: string, action?: string) => api.get('/api/admin/scanner', { params: { borrow_id, ...(action ? { action } : {}) } }),
    process: (borrow_id: string, action: 'claim' | 'return') => api.post('/api/admin/scanner/process', { borrow_id, action }),
  },

  // Awards
  awards: {
    list: () => api.get<User[]>('/api/admin/awards'),
  },

  // Reports
  reports: {
    list: (params?: any) => api.get('/api/admin/reports', { params }),
    pdf: (params?: any) => api.get('/api/admin/reports/pdf', { params, responseType: 'blob' }),
  },

  // Settings
  settings: {
    get: () => api.get('/api/admin/settings'),
    update: (data: FormData) => api.post('/api/admin/settings', data),
  },
};