package com.example.TechBlog.config;

import com.example.TechBlog.security.JwtAuthEntryPoint;
import com.example.TechBlog.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthEntryPoint unauthorizedHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, JwtAuthEntryPoint unauthorizedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 1. Cấu hình quy tắc CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép các nguồn gốc của Frontend (React, Vite, Vue, Next.js...)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:4200"
        ));
        
        // Cho phép các phương thức HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Cho phép tất cả các Header (đặc biệt là Authorization, Content-Type)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Cho phép gửi kèm cookie / thông tin xác thực nếu cần
        configuration.setAllowCredentials(true);
        
        // Thời gian cache kết quả kiểm tra Pre-flight (3600 giây = 1 giờ) để trình duyệt không phải hỏi lại liên tục
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho mọi API
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 2. Kích hoạt cấu hình CORS đã khai báo ở trên
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public các API xác thực đăng ký/đăng nhập
                .requestMatchers("/api/auth/**").permitAll()
                // Public tài liệu Swagger/OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                // Cho phép xem bài viết, chuyên mục, khóa học, bài học, tải file (GET) mà không bắt buộc đăng nhập
                .requestMatchers(HttpMethod.GET,
                        "/api/posts", "/api/posts/**",
                        "/api/courses", "/api/courses/**",
                        "/api/categories", "/api/categories/**",
                        "/api/v1/categories", "/api/v1/categories/**",
                        "/api/lessons/**",
                        "/api/files/**"
                ).permitAll()
                // Mọi request còn lại (Tạo bài viết, sửa, xóa, ...) đều bắt buộc đăng nhập
                .anyRequest().authenticated()
            );

        // Đặt JwtAuthenticationFilter chạy trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
