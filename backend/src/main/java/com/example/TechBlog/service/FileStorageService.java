package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import com.example.TechBlog.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );

    // Tự động tạo thư mục uploads nếu chưa tồn tại khi server khởi động
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ file!", ex);
        }
    }

    // 1. Lưu file lên server
    public FileUploadResponse storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn một file hợp lệ!");
        }

        String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);

        // Kiểm tra định dạng file ảnh hợp lệ
        if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            throw new IllegalArgumentException("Chỉ chấp nhận các file ảnh: " + ALLOWED_EXTENSIONS);
        }

        // Tạo tên file ngẫu nhiên an toàn để chống trùng lặp
        String uniqueFileName = UUID.randomUUID() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Tự động tạo URL đầy đủ: http://localhost:8080/api/files/{uniqueFileName}
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(uniqueFileName)
                    .toUriString();

            return FileUploadResponse.builder()
                    .fileName(uniqueFileName)
                    .fileUrl(fileDownloadUri)
                    .fileType(file.getContentType())
                    .size(file.getSize())
                    .build();

        } catch (IOException ex) {
            throw new RuntimeException("Lưu file thất bại: " + uniqueFileName, ex);
        }
    }

    // 2. Đọc file để phục vụ tải về / xem ảnh
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Không tìm thấy file: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Đường dẫn file không hợp lệ: " + fileName);
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1) {
            return "";
        }
        return filename.substring(lastIndex);
    }
}
