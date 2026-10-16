package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
public class PostRequest {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Slug cannot be blank")
    private String slug;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private String thumbnailUrl;

    @NotNull(message = "Category ID cannot be null")
    private Long categoryId;

    public PostRequest() {
    }

    @Builder
    public PostRequest(String title, String slug, String content, String thumbnailUrl, Long categoryId) {
        this.title = title;
        this.slug = slug;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.categoryId = categoryId;
    }
}
