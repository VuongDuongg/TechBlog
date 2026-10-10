package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {

    @NotBlank(message = "Tiêu đề bài học không được để trống")
    private String title;

    private String content;

    @NotNull(message = "Thứ tự bài học không được để trống")
    @PositiveOrZero(message = "Thứ tự bài học phải >= 0")
    private Integer orderIndex;

    @NotNull(message = "Khóa học không được để trống")
    private Long courseId;
}
