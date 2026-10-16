package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class EnrollmentStatusResponse {

    private boolean isEnrolled;
    private Integer progress;

    public EnrollmentStatusResponse() {
    }

    @Builder
    public EnrollmentStatusResponse(boolean isEnrolled, Integer progress) {
        this.isEnrolled = isEnrolled;
        this.progress = progress;
    }
}
