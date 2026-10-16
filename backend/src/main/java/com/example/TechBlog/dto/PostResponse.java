package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostResponse {

    private Long id;
    private String title;
    private String slug;
    private String content;
    private String thumbnailUrl;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse() {
    }

    @Builder
    public PostResponse(Long id, String title, String slug, String content, String thumbnailUrl, Long categoryId, String categoryName, Long authorId, String authorName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.authorId = authorId;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
