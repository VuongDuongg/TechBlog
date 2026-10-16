package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseRequest {

    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    private String title;

    @NotBlank(message = "Mô tả khóa học không được để trống")
    private String description;

    private String thumbnailUrl;

    @NotNull(message = "Giá tiền không được để trống")
    @PositiveOrZero(message = "Giá tiền phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    public CourseRequest() {
    }

    @Builder
    public CourseRequest(String title, String description, String thumbnailUrl, BigDecimal price, Long categoryId) {
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.price = price;
        this.categoryId = categoryId;
    }
}
