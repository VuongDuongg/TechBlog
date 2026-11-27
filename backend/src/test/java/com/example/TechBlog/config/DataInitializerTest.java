package com.example.TechBlog.config;

import com.example.TechBlog.entity.Role;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.repository.RoleRepository;
import com.example.TechBlog.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void prodProfileRejectsMissingAdminCredentials() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder, env, "", "");

        assertThrows(IllegalStateException.class, () -> initializer.run());
    }

    @Test
    void prodProfileRejectsDefaultWeakAdminPassword() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder, env, "owner@techblog.dev", "admin123");

        assertThrows(IllegalStateException.class, () -> initializer.run());
    }

    @Test
    void seedsAdminUsingConfiguredCredentials() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        Role userRole = Role.builder().name("ROLE_USER").build();
        Role adminRole = Role.builder().name("ROLE_ADMIN").build();
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
        when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRepository.existsByEmail("owner@techblog.dev")).thenReturn(false);
        when(passwordEncoder.encode("S3cur3P@ss!")).thenReturn("encoded-pass");

        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder, env, "owner@techblog.dev", "S3cur3P@ss!");

        initializer.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("owner@techblog.dev", captor.getValue().getEmail());
        assertEquals("encoded-pass", captor.getValue().getPassword());
    }
}
