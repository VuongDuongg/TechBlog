package com.example.TechBlog.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "lessons")
@Getter
@Setter
public class Lesson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Lesson() {
    }

    @Builder
    public Lesson(Long id, String title, String content, Integer orderIndex, Course course) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.orderIndex = orderIndex;
        this.course = course;
    }
}
