package com.example.TechBlog.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    @NotEmpty(message = "Danh sách role không được để trống")
    private Set<String> roleNames; // Ví dụ: ["ROLE_USER", "ROLE_ADMIN"]
}
