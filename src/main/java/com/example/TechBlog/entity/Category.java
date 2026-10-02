package com.example.TechBlog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "categories")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder 

public class Category{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @Column(nullable = false, unique = true, length = 100)
    private String slug;

}