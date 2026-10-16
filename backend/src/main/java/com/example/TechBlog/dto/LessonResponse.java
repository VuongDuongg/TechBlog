package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class LessonResponse {

    private Long id;
    private String title;
    private String content;
    private Integer orderIndex;
    private Long courseId;
    private String courseTitle;

    public LessonResponse() {
    }

    @Builder
    public LessonResponse(Long id, String title, String content, Integer orderIndex, Long courseId, String courseTitle) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.orderIndex = orderIndex;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
    }
}
