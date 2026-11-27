package com.example.TechBlog.service;

import com.example.TechBlog.dto.UpdateUserRoleRequest;
import com.example.TechBlog.dto.UserProfileResponse;
import com.example.TechBlog.entity.Role;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.repository.RoleRepository;
import com.example.TechBlog.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceRootAdminTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void configuredRootAdminCanAssignAdminRole() {
        UserService userService = new UserService(
                userRepository, roleRepository, passwordEncoder, "owner@techblog.dev");

        User target = User.builder().id(2L).email("member@techblog.dev").fullName("Member").roles(Set.of()).build();
        Role adminRole = Role.builder().name("ROLE_ADMIN").build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserRoleRequest req = new UpdateUserRoleRequest();
        req.setRoleNames(Set.of("ROLE_ADMIN"));

        UserProfileResponse response = userService.updateUserRoles(2L, req, "owner@techblog.dev");
        assertEquals(List.of("ROLE_ADMIN"), response.getRoles());
    }

    @Test
    void nonRootAdminCannotAssignRolesEvenIfNamedAdminExample() {
        UserService userService = new UserService(
                userRepository, roleRepository, passwordEncoder, "owner@techblog.dev");

        UpdateUserRoleRequest req = new UpdateUserRoleRequest();
        req.setRoleNames(Set.of("ROLE_ADMIN"));

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUserRoles(2L, req, "admin@example.com"));
    }
}
