package com.example.TechBlog.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "enrollments",
    uniqueConstraints = {
        // Ràng buộc duy nhất: Mỗi user chỉ được đăng ký một khóa học đúng 1 lần
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
    }
)
@Getter
@Setter
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Trạng thái khóa học: ACTIVE (Đang học), COMPLETED (Đã hoàn thành)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // Tiến độ học (từ 0% đến 100%)
    private Integer progress = 0;

    @CreationTimestamp
    private LocalDateTime enrolledAt;

    public enum EnrollmentStatus {
        ACTIVE,
        COMPLETED
    }

    public Enrollment() {
        this.status = EnrollmentStatus.ACTIVE;
        this.progress = 0;
    }

    @Builder
    public Enrollment(Long id, User user, Course course, EnrollmentStatus status, Integer progress, LocalDateTime enrolledAt) {
        this.id = id;
        this.user = user;
        this.course = course;
        this.status = status != null ? status : EnrollmentStatus.ACTIVE;
        this.progress = progress != null ? progress : 0;
        this.enrolledAt = enrolledAt;
    }
}
