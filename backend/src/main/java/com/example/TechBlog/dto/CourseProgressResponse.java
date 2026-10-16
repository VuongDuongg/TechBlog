package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
public class CourseProgressResponse {

    private Long courseId;
    private String courseTitle;
    private int totalLessons;
    private int completedCount;
    private int progressPercentage;
    private String status;
    private List<Long> completedLessonIds;

    public CourseProgressResponse() {
    }

    @Builder
    public CourseProgressResponse(Long courseId, String courseTitle, int totalLessons, int completedCount, int progressPercentage, String status, List<Long> completedLessonIds) {
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.totalLessons = totalLessons;
        this.completedCount = completedCount;
        this.progressPercentage = progressPercentage;
        this.status = status;
        this.completedLessonIds = completedLessonIds;
    }
}
