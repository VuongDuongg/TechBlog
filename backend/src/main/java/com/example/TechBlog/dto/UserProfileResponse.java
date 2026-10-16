package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private List<String> roles;
    private LocalDateTime createdAt;

    public UserProfileResponse() {
    }

    @Builder
    public UserProfileResponse(Long id, String email, String fullName, List<String> roles, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
        this.createdAt = createdAt;
    }
}
