package com.example.TechBlog.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder 

public class Role{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
   @Column(nullable = false, unique = true, length = 100)
    private String name;

    private String description;
}