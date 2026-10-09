package com.example.TechBlog.config;

import com.example.TechBlog.entity.Role;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.repository.RoleRepository;
import com.example.TechBlog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info(">> Bắt đầu kiểm tra và khởi tạo dữ liệu mẫu...");

        // 1. Tạo các Role mặc định nếu chưa tồn tại
        Role roleUser = initRoleIfNotFound("ROLE_USER", "Standard user role");
        Role roleAdmin = initRoleIfNotFound("ROLE_ADMIN", "Administrator role with full permissions");

        // 2. Tạo tài khoản Admin mặc định nếu chưa tồn tại
        String adminEmail = "admin@example.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123")) // Luôn mã hóa mật khẩu bằng BCrypt
                    .roles(new HashSet<>(Set.of(roleUser, roleAdmin))) // Admin có cả 2 role
                    .build();

            userRepository.save(admin);
            log.info(">> Đã khởi tạo tài khoản Admin mặc định: {}", adminEmail);
        } else {
            log.info(">> Tài khoản Admin đã tồn tại, bỏ qua tạo mới.");
        }

        log.info(">> Khởi tạo dữ liệu mẫu hoàn tất!");
    }

    private Role initRoleIfNotFound(String roleName, String description) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name(roleName)
                            .description(description)
                            .build();
                    log.info(">> Đã tạo mới Role: {}", roleName);
                    return roleRepository.save(newRole);
                });
    }
}
