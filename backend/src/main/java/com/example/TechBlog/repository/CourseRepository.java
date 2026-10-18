package com.example.TechBlog.repository;

import com.example.TechBlog.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    Page<Course> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Course> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
