package com.example.TechBlog.service;

import com.example.TechBlog.dto.LessonRequest;
import com.example.TechBlog.dto.LessonResponse;
import com.example.TechBlog.entity.Course;
import com.example.TechBlog.entity.Lesson;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CourseRepository;
import com.example.TechBlog.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    // 1. Lấy danh sách bài học của một khóa học theo thứ tự
    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + courseId);
        }
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 2. Thêm mới bài học vào khóa học
    @Transactional
    public LessonResponse createLesson(LessonRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + request.getCourseId()));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        return mapToResponse(lessonRepository.save(lesson));
    }

    // 3. Xóa bài học
    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học với ID: " + id));
        lessonRepository.delete(lesson);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .courseId(lesson.getCourse().getId())
                .courseTitle(lesson.getCourse().getTitle())
                .build();
    }
}
