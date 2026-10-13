package com.example.TechBlog.repository;

import com.example.TechBlog.entity.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Kiểm tra xem User đã đăng ký Course này chưa
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    // 2. Tìm bản ghi đăng ký cụ thể của 1 User với 1 Course
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    // 3. Lấy danh sách các khóa học mà 1 User đã đăng ký (hỗ trợ phân trang)
    Page<Enrollment> findByUserIdOrderByEnrolledAtDesc(Long userId, Pageable pageable);

    // 4. Đếm số lượng học viên đã đăng ký khóa học này
    long countByCourseId(Long courseId);
}
