package com.example.TechBlog.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "roles")
@Getter
@Setter
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    private String description;

    public Role() {
    }

    @Builder
    public Role(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}