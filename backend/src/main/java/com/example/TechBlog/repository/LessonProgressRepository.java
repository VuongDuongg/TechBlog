package com.example.TechBlog.repository;

import com.example.TechBlog.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    List<LessonProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserIdAndCourseIdAndCompletedTrue(Long userId, Long courseId);

    boolean existsByUserIdAndLessonIdAndCompletedTrue(Long userId, Long lessonId);
}
