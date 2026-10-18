package com.example.TechBlog.service;

import com.example.TechBlog.dto.CourseRequest;
import com.example.TechBlog.dto.CourseResponse;
import com.example.TechBlog.entity.Category;
import com.example.TechBlog.entity.Course;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CategoryRepository;
import com.example.TechBlog.repository.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public CourseService(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    // 1. Lấy danh sách khóa học (hỗ trợ phân trang)
    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(this::mapToResponse);
    }

    // 1.1 Tìm kiếm và lọc khóa học nâng cao (Sử dụng Specification an toàn và tương thích 100% với PostgreSQL)
    @Transactional(readOnly = true)
    public Page<CourseResponse> searchCourses(String keyword, Long categoryId, Boolean isFree, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Course> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                jakarta.persistence.criteria.Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                jakarta.persistence.criteria.Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, descLike));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (isFree != null) {
                if (isFree) {
                    predicates.add(cb.equal(root.get("price"), java.math.BigDecimal.ZERO));
                } else {
                    predicates.add(cb.greaterThan(root.get("price"), java.math.BigDecimal.ZERO));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return courseRepository.findAll(spec, pageable).map(this::mapToResponse);
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
                .thumbnailUrl(request.getThumbnailUrl())
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
        course.setThumbnailUrl(request.getThumbnailUrl());
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
                .thumbnailUrl(course.getThumbnailUrl())
                .price(course.getPrice())
                .categoryId(course.getCategory().getId())
                .categoryName(course.getCategory().getName())
                .totalLessons(course.getLessons() != null ? course.getLessons().size() : 0)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
