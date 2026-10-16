package com.example.TechBlog.controller;

import com.example.TechBlog.dto.CommentRequest;
import com.example.TechBlog.dto.CommentResponse;
import com.example.TechBlog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Lấy danh sách bình luận của bài viết (Public - ai cũng xem được)
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId, pageable));
    }

    // Viết bình luận vào bài viết (Bắt buộc đăng nhập)
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            Authentication authentication,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.createComment(postId, authentication.getName(), request));
    }

    // Xóa bình luận (Bắt buộc đăng nhập: Tác giả hoặc ADMIN)
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        commentService.deleteComment(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
