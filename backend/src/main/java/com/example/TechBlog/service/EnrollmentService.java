package com.example.TechBlog.service;

import com.example.TechBlog.dto.EnrollmentResponse;
import com.example.TechBlog.dto.EnrollmentStatusResponse;
import com.example.TechBlog.entity.Course;
import com.example.TechBlog.entity.Enrollment;
import com.example.TechBlog.entity.Enrollment.EnrollmentStatus;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CourseRepository;
import com.example.TechBlog.repository.EnrollmentRepository;
import com.example.TechBlog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
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
