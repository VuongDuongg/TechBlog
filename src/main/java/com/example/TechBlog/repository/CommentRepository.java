package com.example.TechBlog.repository;

import com.example.TechBlog.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Lấy danh sách bình luận của bài viết, sắp xếp mới nhất lên đầu (hỗ trợ phân trang)
    Page<Comment> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);
}
