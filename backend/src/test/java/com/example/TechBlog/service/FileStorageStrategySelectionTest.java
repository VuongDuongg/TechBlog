package com.example.TechBlog.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class FileStorageStrategySelectionTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(LocalFileStorageService.class, CloudinaryFileStorageService.class);

    @TempDir
    Path tempDir;

    @Test
    void selectsLocalStorageByDefault() {
        contextRunner
                .withPropertyValues("app.upload.dir=" + tempDir.toString().replace("\\", "/"))
                .run(context -> {
                    assertThat(context).hasSingleBean(FileStorageService.class);
                    assertThat(context.getBean(FileStorageService.class))
                            .isInstanceOf(LocalFileStorageService.class);
                });
    }

    @Test
    void selectsCloudinaryStorageWhenConfigured() {
        contextRunner
                .withPropertyValues(
                        "app.storage.type=cloudinary",
                        "app.cloudinary.cloud-name=demo-cloud",
                        "app.cloudinary.api-key=demo-key",
                        "app.cloudinary.api-secret=demo-secret")
                .run(context -> {
                    assertThat(context).hasSingleBean(FileStorageService.class);
                    assertThat(context.getBean(FileStorageService.class))
                            .isInstanceOf(CloudinaryFileStorageService.class);
                });
    }
}
