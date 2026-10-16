package com.example.TechBlog.controller;

import com.example.TechBlog.dto.UpdateProfileRequest;
import com.example.TechBlog.dto.UpdateUserRoleRequest;
import com.example.TechBlog.dto.UserProfileResponse;
import com.example.TechBlog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1. Lấy thông tin cá nhân của người đang đăng nhập (Bất kỳ user nào có đăng nhập)
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(authentication.getName()));
    }

    // 2. Cập nhật thông tin cá nhân của chính mình
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(authentication.getName(), request));
    }

    // 3. ADMIN: Lấy danh sách toàn bộ người dùng
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserProfileResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    // 4. ADMIN: Cập nhật Role cho người dùng theo ID
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserRoles(id, request, authentication.getName()));
    }
}
