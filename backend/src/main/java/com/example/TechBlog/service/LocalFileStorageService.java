package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import com.example.TechBlog.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        ensureStorageDirectoryExists();
    }

    @PostConstruct
    public void init() {
        ensureStorageDirectoryExists();
    }

    private void ensureStorageDirectoryExists() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ file!", ex);
        }
    }

    @Override
    public FileUploadResponse storeFile(MultipartFile file) {
        String fileExtension = FileStorageService.validateAndExtractImageExtension(file);
        String uniqueFileName = UUID.randomUUID() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Đường dẫn lưu file không hợp lệ!");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return FileUploadResponse.builder()
                    .fileName(uniqueFileName)
                    .fileUrl("/api/files/" + uniqueFileName)
                    .fileType(file.getContentType())
                    .size(file.getSize())
                    .build();
        } catch (IOException ex) {
            throw new RuntimeException("Lưu file thất bại: " + uniqueFileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        if (fileName == null || fileName.isBlank() || fileName.contains("..")) {
            throw new ResourceNotFoundException("Không tìm thấy file: " + fileName);
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new ResourceNotFoundException("Không tìm thấy file: " + fileName);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Không tìm thấy file: " + fileName);
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Đường dẫn file không hợp lệ: " + fileName);
        }
    }
}
