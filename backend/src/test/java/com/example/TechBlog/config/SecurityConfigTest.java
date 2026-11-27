package com.example.TechBlog.config;

import com.example.TechBlog.security.JwtAuthEntryPoint;
import com.example.TechBlog.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Mock
    private JwtAuthEntryPoint unauthorizedHandler;

    @Test
    void parseAllowedOriginsTrimsWhitespaceAndSkipsBlankEntries() {
        List<String> origins = SecurityConfig.parseAllowedOrigins(
                " https://techblog.vercel.app , , https://preview.techblog.vercel.app/  ");

        assertEquals(
                List.of("https://techblog.vercel.app", "https://preview.techblog.vercel.app"),
                origins);
    }

    @Test
    void parseAllowedOriginsRejectsBlankConfiguration() {
        assertThrows(IllegalStateException.class, () -> SecurityConfig.parseAllowedOrigins("   ,  "));
    }

    @Test
    void corsConfigurationUsesConfiguredOrigins() {
        SecurityConfig config = new SecurityConfig(
                jwtAuthenticationFilter,
                unauthorizedHandler,
                "https://techblog.vercel.app,http://localhost:5173");

        CorsConfigurationSource source = config.corsConfigurationSource();
        CorsConfiguration cors = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/courses"));

        assertNotNull(cors);
        assertEquals(List.of("https://techblog.vercel.app", "http://localhost:5173"), cors.getAllowedOrigins());
    }
}
