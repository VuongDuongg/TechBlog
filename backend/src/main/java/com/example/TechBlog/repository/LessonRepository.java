package com.example.TechBlog.repository;

import com.example.TechBlog.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    // Lấy tất cả bài học thuộc về một khóa học, sắp xếp theo thứ tự hiển thị (orderIndex tăng dần)
    List<Lesson> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    // Xóa tất cả bài học theo courseId nếu cần
    void deleteByCourseId(Long courseId);
}
