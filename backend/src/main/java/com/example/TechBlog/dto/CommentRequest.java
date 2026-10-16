package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Nội dung bình luận không được để trống")
    @Size(max = 1000, message = "Bình luận tối đa 1000 ký tự")
    private String content;

    public CommentRequest() {
    }

    @Builder
    public CommentRequest(String content) {
        this.content = content;
    }
}
