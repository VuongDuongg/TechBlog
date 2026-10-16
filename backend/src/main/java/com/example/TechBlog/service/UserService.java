package com.example.TechBlog.service;

import com.example.TechBlog.dto.UpdateProfileRequest;
import com.example.TechBlog.dto.UpdateUserRoleRequest;
import com.example.TechBlog.dto.UserProfileResponse;
import com.example.TechBlog.entity.Role;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.RoleRepository;
import com.example.TechBlog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // 1. Lấy thông tin cá nhân dựa vào email trong JWT Token
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);
        return mapToProfileResponse(user);
    }

    // 2. Cập nhật thông tin cá nhân của người đang đăng nhập
    @Transactional
    public UserProfileResponse updateCurrentUserProfile(String currentUserEmail, UpdateProfileRequest request) {
        User user = getUserByEmail(currentUserEmail);
        user.setFullName(request.getFullName());
        return mapToProfileResponse(userRepository.save(user));
    }

    // 3. ADMIN: Lấy danh sách tất cả user trong hệ thống (phân trang)
    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToProfileResponse);
    }

    public static final String ROOT_ADMIN_EMAIL = "admin@example.com";

    // 4. ADMIN: Cập nhật Role cho một User bất kỳ theo ID (Bảo vệ quyền Root Admin)
    @Transactional
    public UserProfileResponse updateUserRoles(Long userId, UpdateUserRoleRequest request, String currentAdminEmail) {
        // 1. Chỉ Root Admin (admin@example.com) mới có quyền cấp hoặc thu hồi quyền Admin của người khác
        if (!ROOT_ADMIN_EMAIL.equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalArgumentException("Chỉ Quản trị viên tối cao (Root Admin: " + ROOT_ADMIN_EMAIL + ") mới có quyền phân quyền hoặc thay đổi quyền Quản trị viên!");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        // 2. Không thể tự thay đổi quyền hạn của chính tài khoản mình
        if (targetUser.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalArgumentException("Bạn không thể tự thay đổi vai trò hoặc quyền hạn của chính tài khoản mình!");
        }

        // 3. Tuyệt đối không cho phép hạ quyền của Root Admin
        if (ROOT_ADMIN_EMAIL.equalsIgnoreCase(targetUser.getEmail()) && !request.getRoleNames().contains("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Tuyệt đối không thể hạ quyền Quản trị viên của tài khoản Root Admin (" + ROOT_ADMIN_EMAIL + ")!");
        }

        Set<Role> updatedRoles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role: " + roleName));
            updatedRoles.add(role);
        }

        targetUser.setRoles(updatedRoles);
        return mapToProfileResponse(userRepository.save(targetUser));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
