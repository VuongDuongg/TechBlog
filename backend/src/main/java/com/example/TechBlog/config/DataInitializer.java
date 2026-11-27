package com.example.TechBlog.config;

import com.example.TechBlog.entity.Role;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.repository.RoleRepository;
import com.example.TechBlog.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        validateAdminCredentials();
        log.info(">> Bắt đầu kiểm tra và khởi tạo dữ liệu mẫu...");

        // 1. Tạo các Role mặc định nếu chưa tồn tại
        Role roleUser = initRoleIfNotFound("ROLE_USER", "Standard user role");
        Role roleAdmin = initRoleIfNotFound("ROLE_ADMIN", "Administrator role with full permissions");

        // 2. Tạo tài khoản Admin mặc định nếu chưa tồn tại
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword)) // Luôn mã hóa mật khẩu bằng BCrypt
                    .roles(new HashSet<>(Set.of(roleUser, roleAdmin))) // Admin có cả 2 role
                    .build();

            userRepository.save(admin);
            log.info(">> Đã khởi tạo tài khoản Admin mặc định: {}", adminEmail);
        } else {
            log.info(">> Tài khoản Admin đã tồn tại, bỏ qua tạo mới.");
        }

        log.info(">> Khởi tạo dữ liệu mẫu hoàn tất!");
    }

    private void validateAdminCredentials() {
        boolean isProd = environment.acceptsProfiles(Profiles.of("prod"));
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException("app.admin.email and app.admin.password must be configured");
        }
        if (isProd && "admin123".equals(adminPassword.trim())) {
            throw new IllegalStateException("Default weak admin password is not allowed when prod profile is active");
        }
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
