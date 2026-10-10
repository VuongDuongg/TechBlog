package com.example.TechBlog.repository;

import com.example.TechBlog.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // Lọc các khóa học theo danh mục (hỗ trợ phân trang)
    Page<Course> findByCategoryId(Long categoryId, Pageable pageable);

    // Tìm kiếm khóa học theo từ khóa ở tiêu đề (không phân biệt hoa thường)
    Page<Course> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
