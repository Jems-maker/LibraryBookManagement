// Global type definitions for the Library Management System

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  student_id: string;
  role: 'admin' | 'student';
  email_verified_at: string | null;
  profile?: StudentProfile;
  total_points?: number;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  course: string | null;
  year_level: string | null;
  gender: string | null;
  student_id: string | null;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Publisher {
  id: number;
  name: string;
  address?: string;
}

export interface Book {
  id: number;
  book_id: string;
  title: string;
  description: string | null;
  isbn: string | null;
  total_copies: number;
  available_copies: number;
  status: 'Available' | 'Unavailable';
  cover_image: string | null;
  author: Author;
  category: Category;
  publisher?: Publisher;
  total_borrows?: number;
  is_recommended?: boolean;
}

export interface BorrowRecord {
  id: number;
  borrow_id: string;
  user_id: number;
  book_id: number;
  status: 'Pending Claim' | 'Borrowed' | 'Overdue' | 'Returned';
  borrow_date: string | null;
  due_date: string | null;
  return_date: string | null;
  qr_code_path: string | null;
  book?: Book;
  user?: User;
}

export interface BorrowRequest {
  id: number;
  user_id: number;
  book_id: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  return_date: string;
  quantity: number;
  borrow_duration_days: number;
  created_at: string;
  book?: Book;
  user?: User;
}

export interface RewardPoint {
  id: number;
  user_id: number;
  points: number;
  reason: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: { url: string | null; label: string; active: boolean }[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
