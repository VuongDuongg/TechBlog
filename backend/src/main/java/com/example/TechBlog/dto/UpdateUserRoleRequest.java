package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRoleRequest {

    @NotEmpty(message = "Danh sách role không được để trống")
    private Set<String> roleNames; // Ví dụ: ["ROLE_USER", "ROLE_ADMIN"]

    public UpdateUserRoleRequest() {
    }

    @Builder
    public UpdateUserRoleRequest(Set<String> roleNames) {
        this.roleNames = roleNames;
    }
}
