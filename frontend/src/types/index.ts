export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  cover?: string;
  category_id?: number;
  category_name?: string;
  tags: string[];
  author_id: number;
  author_name: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface PostListResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PostResponse {
  success: boolean;
  message?: string;
  data?: Post;
}
