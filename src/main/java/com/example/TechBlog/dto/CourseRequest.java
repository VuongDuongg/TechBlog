package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    private String title;

    @NotBlank(message = "Mô tả khóa học không được để trống")
    private String description;

    @NotNull(message = "Giá tiền không được để trống")
    @PositiveOrZero(message = "Giá tiền phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;
}
