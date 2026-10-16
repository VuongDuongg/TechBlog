package com.example.TechBlog.service;

import com.example.TechBlog.dto.CourseProgressResponse;
import com.example.TechBlog.dto.EnrollmentResponse;
import com.example.TechBlog.dto.EnrollmentStatusResponse;
import com.example.TechBlog.entity.Course;
import com.example.TechBlog.entity.Enrollment;
import com.example.TechBlog.entity.Enrollment.EnrollmentStatus;
import com.example.TechBlog.entity.Lesson;
import com.example.TechBlog.entity.LessonProgress;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CourseRepository;
import com.example.TechBlog.repository.EnrollmentRepository;
import com.example.TechBlog.repository.LessonProgressRepository;
import com.example.TechBlog.repository.LessonRepository;
import com.example.TechBlog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository lessonProgressRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
    }

    // 1. Đăng ký khóa học
    @Transactional
    public EnrollmentResponse enrollCourse(Long courseId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + courseId));

        // Kiểm tra xem đã đăng ký trước đó chưa
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new IllegalArgumentException("Bạn đã đăng ký khóa học này rồi!");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .progress(0)
                .build();

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    // 2. Lấy danh sách khóa học của người đang đăng nhập (My Courses)
    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getMyCourses(String currentUserEmail, Pageable pageable) {
        User user = getUserByEmail(currentUserEmail);
        return enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    // 3. Kiểm tra trạng thái đã đăng ký khóa học này chưa
    @Transactional(readOnly = true)
    public EnrollmentStatusResponse checkEnrollmentStatus(Long courseId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);
        return enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .map(enrollment -> EnrollmentStatusResponse.builder()
                        .isEnrolled(true)
                        .progress(enrollment.getProgress())
                        .build())
                .orElseGet(() -> EnrollmentStatusResponse.builder()
                        .isEnrolled(false)
                        .progress(0)
                        .build());
    }

    // 4. Lấy chi tiết tiến độ học tập của khóa học
    @Transactional
    public CourseProgressResponse getCourseProgress(Long courseId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đăng ký khóa học này!"));

        Course course = enrollment.getCourse();
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        int totalLessons = lessons.size();

        List<LessonProgress> progresses = lessonProgressRepository.findByUserIdAndCourseId(user.getId(), courseId);
        List<Long> completedLessonIds = progresses.stream()
                .filter(LessonProgress::isCompleted)
                .map(lp -> lp.getLesson().getId())
                .toList();

        int completedCount = completedLessonIds.size();
        int progressPercentage = totalLessons > 0 ? (completedCount * 100) / totalLessons : 0;

        // Cập nhật lại vào Enrollment nếu có sai lệch
        if (enrollment.getProgress() == null || enrollment.getProgress() != progressPercentage) {
            enrollment.setProgress(progressPercentage);
            if (progressPercentage >= 100 && totalLessons > 0) {
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
            } else {
                enrollment.setStatus(EnrollmentStatus.ACTIVE);
            }
            enrollmentRepository.save(enrollment);
        }

        return CourseProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalLessons(totalLessons)
                .completedCount(completedCount)
                .progressPercentage(progressPercentage)
                .status(enrollment.getStatus().name())
                .completedLessonIds(completedLessonIds)
                .build();
    }

    // 5. Đánh dấu hoàn thành / chưa hoàn thành bài học (Toggle Lesson Progress)
    @Transactional
    public CourseProgressResponse toggleLessonProgress(Long courseId, Long lessonId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đăng ký khóa học này!"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học với ID: " + lessonId));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Bài học không thuộc về khóa học này!");
        }

        LessonProgress lessonProgress = lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .course(lesson.getCourse())
                        .completed(false)
                        .build());

        boolean newCompletedState = !lessonProgress.isCompleted();
        lessonProgress.setCompleted(newCompletedState);
        lessonProgress.setCompletedAt(newCompletedState ? LocalDateTime.now() : null);
        lessonProgressRepository.save(lessonProgress);

        // Tính lại toàn bộ tiến độ
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        int totalLessons = lessons.size();

        List<LessonProgress> allProgresses = lessonProgressRepository.findByUserIdAndCourseId(user.getId(), courseId);
        List<Long> completedLessonIds = allProgresses.stream()
                .filter(LessonProgress::isCompleted)
                .map(lp -> lp.getLesson().getId())
                .toList();

        int completedCount = completedLessonIds.size();
        int progressPercentage = totalLessons > 0 ? (completedCount * 100) / totalLessons : 0;

        enrollment.setProgress(progressPercentage);
        if (progressPercentage >= 100 && totalLessons > 0) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
        } else {
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
        }
        enrollmentRepository.save(enrollment);

        return CourseProgressResponse.builder()
                .courseId(courseId)
                .courseTitle(lesson.getCourse().getTitle())
                .totalLessons(totalLessons)
                .completedCount(completedCount)
                .progressPercentage(progressPercentage)
                .status(enrollment.getStatus().name())
                .completedLessonIds(completedLessonIds)
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        Course course = enrollment.getCourse();
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseDescription(course.getDescription())
                .courseThumbnailUrl(course.getThumbnailUrl())
                .coursePrice(course.getPrice())
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}
