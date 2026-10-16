package com.example.TechBlog.service;

import com.example.TechBlog.dto.CommentRequest;
import com.example.TechBlog.dto.CommentResponse;
import com.example.TechBlog.entity.Comment;
import com.example.TechBlog.entity.Post;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CommentRepository;
import com.example.TechBlog.repository.PostRepository;
import com.example.TechBlog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // 1. Xem danh sách bình luận của bài viết (Public)
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPostId(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId);
        }
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
                .map(this::mapToResponse);
    }

    // 2. Thêm bình luận (Bắt buộc đăng nhập)
    @Transactional
    public CommentResponse createComment(Long postId, String currentUserEmail, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + currentUserEmail));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .user(user)
                .build();

        return mapToResponse(commentRepository.save(comment));
    }

    // 3. Xóa bình luận: Chỉ chủ nhân bình luận HOẶC Admin mới có quyền xóa
    @Transactional
    public void deleteComment(Long commentId, String currentUserEmail, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        // Kiểm tra quyền xóa
        boolean isOwner = comment.getUser().getEmail().equals(currentUserEmail);
        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("Bạn không có quyền xóa bình luận này!");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .userFullName(comment.getUser().getFullName())
                .userEmail(comment.getUser().getEmail())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
