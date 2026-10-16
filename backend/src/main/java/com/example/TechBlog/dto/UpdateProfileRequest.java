package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    public UpdateProfileRequest() {
    }

    @Builder
    public UpdateProfileRequest(String fullName) {
        this.fullName = fullName;
    }
}
