package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

public interface FileStorageService {

    List<String> ALLOWED_IMAGE_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    FileUploadResponse storeFile(MultipartFile file);

    Resource loadFileAsResource(String fileName);

    /**
     * Validates that the uploaded multipart file is non-empty and uses a supported image extension.
     *
     * @return the normalized lowercase extension (including the leading dot)
     */
    static String validateAndExtractImageExtension(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn một file hợp lệ!");
        }

        String originalFilename = Objects.requireNonNull(file.getOriginalFilename(), "Tên file không hợp lệ!");
        int lastDot = originalFilename.lastIndexOf('.');
        String extension = lastDot == -1 ? "" : originalFilename.substring(lastDot).toLowerCase();

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Chỉ chấp nhận các file ảnh: " + ALLOWED_IMAGE_EXTENSIONS);
        }

        return extension;
    }
}
