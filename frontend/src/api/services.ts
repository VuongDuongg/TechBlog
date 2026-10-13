import axiosClient from './axiosClient';
import type { AuthResponse, Comment, Course, Enrollment, Lesson, PageResponse, Post } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface EnrollmentStatus {
  enrolled: boolean;
  progress?: number;
}

// 1. Auth Services
export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return (await axiosClient.post('/auth/login', payload)) as unknown as AuthResponse;
  },
  register: async (payload: RegisterPayload): Promise<string> => {
    return (await axiosClient.post('/auth/register', payload)) as unknown as string;
  },
};

// 2. Course Services
export const courseApi = {
  getAll: async (page = 0, size = 9): Promise<PageResponse<Course>> => {
    return (await axiosClient.get(`/courses?page=${page}&size=${size}`)) as unknown as PageResponse<Course>;
  },
  getById: async (id: number): Promise<Course> => {
    return (await axiosClient.get(`/courses/${id}`)) as unknown as Course;
  },
};

// 3. Lesson Services
export const lessonApi = {
  getByCourseId: async (courseId: number): Promise<Lesson[]> => {
    return (await axiosClient.get(`/lessons/course/${courseId}`)) as unknown as Lesson[];
  },
};

// 4. Enrollment Services
export const enrollmentApi = {
  enroll: async (courseId: number): Promise<Enrollment> => {
    return (await axiosClient.post(`/enrollments/courses/${courseId}`)) as unknown as Enrollment;
  },
  checkStatus: async (courseId: number): Promise<EnrollmentStatus> => {
    return (await axiosClient.get(`/enrollments/courses/${courseId}/status`)) as unknown as EnrollmentStatus;
  },
  getMyCourses: async (page = 0, size = 10): Promise<PageResponse<Enrollment>> => {
    return (await axiosClient.get(`/enrollments/my-courses?page=${page}&size=${size}`)) as unknown as PageResponse<Enrollment>;
  },
};

// 5. Post Services
export const postApi = {
  getAll: async (page = 0, size = 9): Promise<PageResponse<Post>> => {
    return (await axiosClient.get(`/posts?page=${page}&size=${size}`)) as unknown as PageResponse<Post>;
  },
  getById: async (id: number): Promise<Post> => {
    return (await axiosClient.get(`/posts/${id}`)) as unknown as Post;
  },
  getBySlug: async (slug: string): Promise<Post> => {
    return (await axiosClient.get(`/posts/slug/${slug}`)) as unknown as Post;
  },
};

// 6. Comment Services
export const commentApi = {
  getByPostId: async (postId: number, page = 0, size = 20): Promise<PageResponse<Comment>> => {
    return (await axiosClient.get(`/posts/${postId}/comments?page=${page}&size=${size}`)) as unknown as PageResponse<Comment>;
  },
  create: async (postId: number, content: string): Promise<Comment> => {
    return (await axiosClient.post(`/posts/${postId}/comments`, { content })) as unknown as Comment;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/comments/${id}`);
  },
};
