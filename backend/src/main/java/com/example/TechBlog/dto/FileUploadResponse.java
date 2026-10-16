package com.example.TechBlog.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class FileUploadResponse {

    private String fileName;
    private String fileUrl;
    private String fileType;
    private long size;

    public FileUploadResponse() {
    }

    @Builder
    public FileUploadResponse(String fileName, String fileUrl, String fileType, long size) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.size = size;
    }
}
