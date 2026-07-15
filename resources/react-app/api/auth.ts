import api from '@/api/client';
import type { User } from '@/types';

export const authApi = {
  csrf: () => api.get('/sanctum/csrf-cookie'),
  login: (credentials: { email: string; password: string }) =>
    api.post<{ user: User }>('/api/auth/login', credentials),
  adminLogin: (credentials: { username: string; password: string }) =>
    api.post<{ user: User }>('/api/auth/admin-login', credentials),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get<User>('/api/auth/me'),
  register: (data: {
    name: string;
    email: string;
    username: string;
    student_id: string;
    password: string;
    password_confirmation: string;
  }) => api.post<{ user: User }>('/api/auth/register', data),
};
