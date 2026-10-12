package com.example.TechBlog.entity;

import jakarta.persistence.*;
import lombok.*;
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
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
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
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // Tiến độ học (từ 0% đến 100%)
    @Builder.Default
    private Integer progress = 0;

    @CreationTimestamp
    private LocalDateTime enrolledAt;

    public enum EnrollmentStatus {
        ACTIVE,
        COMPLETED
    }
}
