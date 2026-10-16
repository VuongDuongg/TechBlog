package com.example.TechBlog.dto;

import com.example.TechBlog.entity.Enrollment.EnrollmentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EnrollmentResponse {

    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String courseDescription;
    private BigDecimal coursePrice;
    private String courseThumbnailUrl;
    private EnrollmentStatus status;
    private Integer progress;
    private LocalDateTime enrolledAt;

    public EnrollmentResponse() {
    }

    @Builder
    public EnrollmentResponse(Long enrollmentId, Long courseId, String courseTitle, String courseDescription, BigDecimal coursePrice, String courseThumbnailUrl, EnrollmentStatus status, Integer progress, LocalDateTime enrolledAt) {
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.courseDescription = courseDescription;
        this.coursePrice = coursePrice;
        this.courseThumbnailUrl = courseThumbnailUrl;
        this.status = status;
        this.progress = progress;
        this.enrolledAt = enrolledAt;
    }
}
