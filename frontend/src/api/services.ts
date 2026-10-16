import axiosClient from './axiosClient';
import type {
  AuthResponse,
  Category,
  Comment,
  Course,
  CourseProgress,
  Enrollment,
  Lesson,
  PageResponse,
  Post,
  UserProfile,
} from '../types';

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

export interface CoursePayload {
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  categoryId: number;
}

export interface PostPayload {
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  categoryId: number;
}

export interface LessonPayload {
  title: string;
  content: string;
  orderIndex: number;
  courseId: number;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
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

// 2. User Services
export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    return (await axiosClient.get('/users/me')) as unknown as UserProfile;
  },
  updateProfile: async (fullName: string): Promise<UserProfile> => {
    return (await axiosClient.put('/users/me', { fullName })) as unknown as UserProfile;
  },
  getAll: async (page = 0, size = 100): Promise<PageResponse<UserProfile>> => {
    return (await axiosClient.get(`/users?page=${page}&size=${size}`)) as unknown as PageResponse<UserProfile>;
  },
  updateRoles: async (userId: number, roleNames: string[]): Promise<UserProfile> => {
    return (await axiosClient.put(`/users/${userId}/roles`, { roleNames })) as unknown as UserProfile;
  },
};

// 3. Category Services
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    return (await axiosClient.get('/v1/categories')) as unknown as Category[];
  },
};

// 4. Course Services
export const courseApi = {
  getAll: async (page = 0, size = 9): Promise<PageResponse<Course>> => {
    return (await axiosClient.get(`/courses?page=${page}&size=${size}`)) as unknown as PageResponse<Course>;
  },
  getById: async (id: number): Promise<Course> => {
    return (await axiosClient.get(`/courses/${id}`)) as unknown as Course;
  },
  create: async (payload: CoursePayload): Promise<Course> => {
    return (await axiosClient.post('/courses', payload)) as unknown as Course;
  },
  update: async (id: number, payload: CoursePayload): Promise<Course> => {
    return (await axiosClient.put(`/courses/${id}`, payload)) as unknown as Course;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/courses/${id}`);
  },
};

// 5. Lesson Services
export const lessonApi = {
  getByCourseId: async (courseId: number): Promise<Lesson[]> => {
    return (await axiosClient.get(`/lessons/course/${courseId}`)) as unknown as Lesson[];
  },
  create: async (payload: LessonPayload): Promise<Lesson> => {
    return (await axiosClient.post('/lessons', payload)) as unknown as Lesson;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/lessons/${id}`);
  },
};

// 6. Enrollment Services
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
  getProgress: async (courseId: number): Promise<CourseProgress> => {
    return (await axiosClient.get(`/enrollments/courses/${courseId}/progress`)) as unknown as CourseProgress;
  },
  toggleProgress: async (courseId: number, lessonId: number): Promise<CourseProgress> => {
    return (await axiosClient.post(`/enrollments/courses/${courseId}/lessons/${lessonId}/toggle`)) as unknown as CourseProgress;
  },
};

// 7. Post Services
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
  create: async (payload: PostPayload): Promise<Post> => {
    return (await axiosClient.post('/posts', payload)) as unknown as Post;
  },
  update: async (id: number, payload: PostPayload): Promise<Post> => {
    return (await axiosClient.put(`/posts/${id}`, payload)) as unknown as Post;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/posts/${id}`);
  },
};

// 8. Comment Services
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

// 9. File Upload Services
export const fileApi = {
  upload: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return (await axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })) as unknown as FileUploadResponse;
  },
};
