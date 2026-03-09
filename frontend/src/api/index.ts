import api from './axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PostListResponse,
  PostResponse,
  Post,
} from '../types';

// 认证相关
export const authAPI = {
  login: (data: LoginRequest) => api.post<any, AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<any, AuthResponse>('/auth/register', data),
};

// 文章相关
export const postAPI = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    category_id?: number;
    keyword?: string;
  }) => api.get<any, PostListResponse>('/posts', { params }),

  getById: (id: number) => api.get<any, PostResponse>(`/posts/${id}`),

  create: (data: Partial<Post>) => api.post<any, PostResponse>('/posts', data),

  update: (id: number, data: Partial<Post>) =>
    api.put<any, PostResponse>(`/posts/${id}`, data),

  delete: (id: number) => api.delete<any, PostResponse>(`/posts/${id}`),
};
