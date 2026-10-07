package com.example.TechBlog.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    int status,
    String error,
    String message,
    String path,
    LocalDateTime timestamp,
    Map<String,String> validationErrors
) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, LocalDateTime.now(), null);
    }

    public ErrorResponse(int status, String error, String message, String path, Map<String,String> validationErrors){
        this(status, error, message, path, LocalDateTime.now(), validationErrors);
    }
}
