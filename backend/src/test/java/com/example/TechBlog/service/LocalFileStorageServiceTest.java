package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import com.example.TechBlog.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storesValidImageAndLoadsItBack() throws Exception {
        LocalFileStorageService service = new LocalFileStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file", "banner.png", "image/png", "png-bytes".getBytes());

        FileUploadResponse response = service.storeFile(file);

        assertNotNull(response.getFileName());
        assertTrue(response.getFileName().endsWith(".png"));
        assertEquals("/api/files/" + response.getFileName(), response.getFileUrl());

        Resource loaded = service.loadFileAsResource(response.getFileName());
        assertTrue(loaded.exists());
        try (var inputStream = loaded.getInputStream()) {
            assertEquals("png-bytes", new String(inputStream.readAllBytes()));
        }
    }

    @Test
    void rejectsUnsupportedExtension() {
        LocalFileStorageService service = new LocalFileStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.svg", "image/svg+xml", "<svg/>".getBytes());

        assertThrows(IllegalArgumentException.class, () -> service.storeFile(file));
    }

    @Test
    void rejectsPathTraversalOnLoad() {
        LocalFileStorageService service = new LocalFileStorageService(tempDir.toString());

        assertThrows(ResourceNotFoundException.class, () -> service.loadFileAsResource("../secret.txt"));
    }
}
