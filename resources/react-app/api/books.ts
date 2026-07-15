import api from '@/api/client';
import type { Book, Category, PaginatedResponse } from '@/types';

export interface BookFilters {
  category?: string;
  search?: string;
  page?: number;
}

export interface SuggestionResult {
  id: number;
  label: string;
  author: string;
  cover: string | null;
}

export interface CategorySuggestion {
  id: number;
  name: string;
  slug: string;
}

export interface SuggestionsResponse {
  books: SuggestionResult[];
  categories: CategorySuggestion[];
}

export interface SuggestionParams {
  q: string;
  category?: string;
}

export const booksApi = {
  list: (filters: BookFilters = {}) =>
    api.get<PaginatedResponse<Book>>('/api/books', { params: filters }),
  get: (id: number) => api.get<Book>(`/api/books/${id}`),
  categories: () => api.get<Category[]>('/api/books/categories'),
  suggestions: (params: SuggestionParams) =>
    api.get<SuggestionsResponse>('/api/books/suggestions', { params }),
};
