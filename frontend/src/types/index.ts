// 1. Ánh xạ từ AuthResponse.java
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

// 2. Ánh xạ từ UserProfileResponse.java
export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
}

// 3. Ánh xạ từ PostResponse.java
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

// 4. Ánh xạ từ CourseResponse.java
export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  categoryId: number;
  categoryName: string;
  totalLessons: number;
  createdAt: string;
}

// 5. Ánh xạ từ LessonResponse.java
export interface Lesson {
  id: number;
  title: string;
  content: string;
  orderIndex: number;
  courseId: number;
  courseTitle: string;
}

// 6. Ánh xạ từ CommentResponse.java
export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  createdAt: string;
}

// 7. Ánh xạ từ EnrollmentResponse.java
export interface Enrollment {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  courseThumbnailUrl?: string;
  coursePrice: number;
  status: 'ACTIVE' | 'COMPLETED';
  progress: number;
  enrolledAt: string;
}

// 8. Định dạng phân trang Page<T> của Spring Data JPA
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
