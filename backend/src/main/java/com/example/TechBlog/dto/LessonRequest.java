package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Data;

@Data
public class LessonRequest {

    @NotBlank(message = "Tiêu đề bài học không được để trống")
    private String title;

    private String content;

    @NotNull(message = "Thứ tự bài học không được để trống")
    @PositiveOrZero(message = "Thứ tự bài học phải >= 0")
    private Integer orderIndex;

    @NotNull(message = "Khóa học không được để trống")
    private Long courseId;

    public LessonRequest() {
    }

    @Builder
    public LessonRequest(String title, String content, Integer orderIndex, Long courseId) {
        this.title = title;
        this.content = content;
        this.orderIndex = orderIndex;
        this.courseId = courseId;
    }
}
