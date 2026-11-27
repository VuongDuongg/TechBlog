package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import com.example.TechBlog.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Flow;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryFileStorageServiceTest {

    @Mock
    private HttpClient httpClient;

    @Mock
    private HttpResponse<String> httpResponse;

    @Test
    void generatesStandardSortedSha1Signature() {
        // Cloudinary expected string to sign: "folder=techblog&timestamp=1700000000my-secret"
        String signature = CloudinaryFileStorageService.generateSignature("techblog", 1700000000L, "my-secret");

        assertEquals("33a5bb8df4c40b603cb131da2f064933d6f5020d", signature);
    }

    @Test
    @SuppressWarnings("unchecked")
    void uploadsImageToCloudinaryRestApiAndReturnsSecureUrl() throws Exception {
        Clock fixedClock = Clock.fixed(Instant.ofEpochSecond(1700000000L), ZoneOffset.UTC);
        when(httpResponse.statusCode()).thenReturn(200);
        when(httpResponse.body()).thenReturn(
                "{\"public_id\":\"techblog/cover123\",\"secure_url\":\"https://res.cloudinary.com/demo/image/upload/v1/techblog/cover123.png\"}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(httpResponse);

        CloudinaryFileStorageService service = new CloudinaryFileStorageService(
                "demo-cloud", "key-123", "my-secret", "techblog", httpClient, fixedClock);

        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", "image-content".getBytes(StandardCharsets.UTF_8));

        FileUploadResponse result = service.storeFile(file);

        assertEquals("https://res.cloudinary.com/demo/image/upload/v1/techblog/cover123.png", result.getFileUrl());
        assertEquals("techblog/cover123", result.getFileName());
        assertEquals("image/png", result.getFileType());

        ArgumentCaptor<HttpRequest> reqCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(reqCaptor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest sent = reqCaptor.getValue();
        assertEquals("https://api.cloudinary.com/v1_1/demo-cloud/image/upload", sent.uri().toString());
        String body = readBody(sent.bodyPublisher().orElseThrow());
        assertTrue(body.contains("name=\"api_key\""));
        assertTrue(body.contains("key-123"));
        assertTrue(body.contains("name=\"folder\""));
        assertTrue(body.contains("techblog"));
        assertTrue(body.contains("name=\"timestamp\""));
        assertTrue(body.contains("1700000000"));
        assertTrue(body.contains("name=\"signature\""));
        assertTrue(body.contains("33a5bb8df4c40b603cb131da2f064933d6f5020d"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void throwsWhenCloudinaryReturnsNon2xxStatus() throws Exception {
        Clock fixedClock = Clock.fixed(Instant.ofEpochSecond(1700000000L), ZoneOffset.UTC);
        when(httpResponse.statusCode()).thenReturn(401);
        when(httpResponse.body()).thenReturn("{\"error\":{\"message\":\"Invalid Signature\"}}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(httpResponse);

        CloudinaryFileStorageService service = new CloudinaryFileStorageService(
                "demo-cloud", "key-123", "my-secret", "techblog", httpClient, fixedClock);

        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", "image-content".getBytes(StandardCharsets.UTF_8));

        assertThrows(RuntimeException.class, () -> service.storeFile(file));
    }

    @Test
    void loadFileAsResourceThrowsNotFoundForCloudinaryStrategy() {
        CloudinaryFileStorageService service = new CloudinaryFileStorageService(
                "demo-cloud", "key-123", "my-secret", "techblog", httpClient, Clock.systemUTC());

        assertThrows(ResourceNotFoundException.class, () -> service.loadFileAsResource("anything.png"));
    }

    private static String readBody(HttpRequest.BodyPublisher publisher) {
        List<byte[]> chunks = new ArrayList<>();
        publisher.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(ByteBuffer item) {
                byte[] bytes = new byte[item.remaining()];
                item.get(bytes);
                chunks.add(bytes);
            }

            @Override
            public void onError(Throwable throwable) {
                throw new RuntimeException(throwable);
            }

            @Override
            public void onComplete() {
            }
        });
        StringBuilder sb = new StringBuilder();
        for (byte[] chunk : chunks) {
            sb.append(new String(chunk, StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}
