package com.example.TechBlog.service;

import com.example.TechBlog.dto.CourseRequest;
import com.example.TechBlog.dto.CourseResponse;
import com.example.TechBlog.entity.Category;
import com.example.TechBlog.entity.Course;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CategoryRepository;
import com.example.TechBlog.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    // 1. Lấy danh sách khóa học (hỗ trợ phân trang)
    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(this::mapToResponse);
    }

    // 2. Lấy chi tiết một khóa học theo ID
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = findCourseById(id);
        return mapToResponse(course);
    }

    // 3. Tạo mới khóa học
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .build();

        return mapToResponse(courseRepository.save(course));
    }

    // 4. Cập nhật khóa học
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = findCourseById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setCategory(category);

        return mapToResponse(courseRepository.save(course));
    }

    // 5. Xóa khóa học
    @Transactional
    public void deleteCourse(Long id) {
        Course course = findCourseById(id);
        courseRepository.delete(course);
    }

    private Course findCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + id));
    }

    // Chuyển đổi Entity -> DTO Response
    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .categoryId(course.getCategory().getId())
                .categoryName(course.getCategory().getName())
                .totalLessons(course.getLessons() != null ? course.getLessons().size() : 0)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
