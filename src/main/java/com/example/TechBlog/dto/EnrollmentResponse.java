package com.example.TechBlog.dto;

import com.example.TechBlog.entity.Enrollment.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
