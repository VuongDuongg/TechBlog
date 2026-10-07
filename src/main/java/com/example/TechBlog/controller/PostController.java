package com.example.TechBlog.controller;

import com.example.TechBlog.dto.PostRequest;
import com.example.TechBlog.dto.PostResponse;
import com.example.TechBlog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // GET /api/posts?page=0&size=10&sort=createdAt,desc
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }

    // GET /api/posts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // GET /api/posts/slug/{slug}
    @GetMapping("/slug/{slug}")
    public ResponseEntity<PostResponse> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }

    // POST /api/posts (Yêu cầu gửi kèm Authorization: Bearer <token>)
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/posts/{id} (Yêu cầu gửi kèm Authorization: Bearer <token>)
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        PostResponse response = postService.updatePost(id, request);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/posts/{id} (Yêu cầu gửi kèm Authorization: Bearer <token>)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok("Post deleted successfully!");
    }
}
