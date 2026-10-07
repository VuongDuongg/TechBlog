package com.example.TechBlog.service;

import com.example.TechBlog.dto.PostRequest;
import com.example.TechBlog.dto.PostResponse;
import com.example.TechBlog.entity.Category;
import com.example.TechBlog.entity.Post;
import com.example.TechBlog.entity.User;
import com.example.TechBlog.exception.ResourceNotFoundException;
import com.example.TechBlog.repository.CategoryRepository;
import com.example.TechBlog.repository.PostRepository;
import com.example.TechBlog.repository.UserRepository;
import com.example.TechBlog.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // Lấy danh sách bài viết kèm phân trang (Public)
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(this::mapToResponse);
    }

    // Lấy chi tiết bài viết theo ID (Public)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return mapToResponse(post);
    }

    // Lấy chi tiết bài viết theo Slug (Public)
    public PostResponse getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with slug: " + slug));
        return mapToResponse(post);
    }

    // Tạo bài viết mới (Cần đăng nhập)
    @Transactional
    public PostResponse createPost(PostRequest request) {
        if (postRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug is already taken: " + request.getSlug());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // Lấy thông tin user hiện tại từ SecurityContext
        CustomUserDetails currentUser = getCurrentAuthenticatedUser();
        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        Post post = Post.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .content(request.getContent())
                .category(category)
                .author(author)
                .build();

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    // Cập nhật bài viết (Chỉ tác giả hoặc Admin mới được sửa)
    @Transactional
    public PostResponse updatePost(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        validateOwnership(post);

        if (!post.getSlug().equals(request.getSlug()) && postRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug is already taken: " + request.getSlug());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setContent(request.getContent());
        post.setCategory(category);

        Post updatedPost = postRepository.save(post);
        return mapToResponse(updatedPost);
    }

    // Xóa bài viết (Chỉ tác giả hoặc Admin mới được xóa)
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        validateOwnership(post);

        postRepository.delete(post);
    }

    // Kiểm tra quyền sở hữu bài viết
    private void validateOwnership(Post post) {
        CustomUserDetails currentUser = getCurrentAuthenticatedUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !post.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to modify this post!");
        }
    }

    private CustomUserDetails getCurrentAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return (CustomUserDetails) principal;
        }
        throw new RuntimeException("User is not authenticated!");
    }

    private PostResponse mapToResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getFullName() : null)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
