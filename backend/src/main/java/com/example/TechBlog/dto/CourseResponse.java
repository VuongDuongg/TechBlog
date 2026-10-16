package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CourseResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private int totalLessons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseResponse() {
    }

    @Builder
    public CourseResponse(Long id, String title, String description, String thumbnailUrl, BigDecimal price, Long categoryId, String categoryName, int totalLessons, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.price = price;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalLessons = totalLessons;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
