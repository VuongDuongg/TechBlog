package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private List<String> roles;

    public AuthResponse() {
        this.type = "Bearer";
    }

    @Builder
    public AuthResponse(String token, String type, Long id, String email, String fullName, List<String> roles) {
        this.token = token;
        this.type = type != null ? type : "Bearer";
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }
}
