package com.example.TechBlog.controller;

import com.example.TechBlog.dto.EnrollmentResponse;
import com.example.TechBlog.dto.EnrollmentStatusResponse;
import com.example.TechBlog.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // 1. Đăng ký khóa học (Bắt buộc đăng nhập)
    @PostMapping("/courses/{courseId}")
    public ResponseEntity<EnrollmentResponse> enrollCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enrollCourse(courseId, authentication.getName()));
    }

    // 2. Lấy danh sách khóa học của tôi (Bắt buộc đăng nhập)
    @GetMapping("/my-courses")
    public ResponseEntity<Page<EnrollmentResponse>> getMyCourses(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.getMyCourses(authentication.getName(), pageable));
    }

    // 3. Kiểm tra trạng thái đã đăng ký khóa học này chưa
    @GetMapping("/courses/{courseId}/status")
    public ResponseEntity<EnrollmentStatusResponse> checkEnrollmentStatus(
            @PathVariable Long courseId,
            Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.checkEnrollmentStatus(courseId, authentication.getName()));
    }
}
