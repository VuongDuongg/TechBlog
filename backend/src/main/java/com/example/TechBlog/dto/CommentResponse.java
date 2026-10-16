package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private Long id;
    private String content;
    private Long postId;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private LocalDateTime createdAt;

    public CommentResponse() {
    }

    @Builder
    public CommentResponse(Long id, String content, Long postId, Long userId, String userFullName, String userEmail, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.postId = postId;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.createdAt = createdAt;
    }
}
