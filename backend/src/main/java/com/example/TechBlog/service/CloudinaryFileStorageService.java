package com.example.TechBlog.service;

import com.example.TechBlog.dto.FileUploadResponse;
import com.example.TechBlog.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.TreeMap;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "cloudinary")
public class CloudinaryFileStorageService implements FileStorageService {

    private static final String CLOUDINARY_UPLOAD_URL_TEMPLATE = "https://api.cloudinary.com/v1_1/%s/image/upload";
    private static final ObjectMapper OBJECT_MAPPER = JsonMapper.builder().build();

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;
    private final HttpClient httpClient;
    private final Clock clock;

    @Autowired
    public CloudinaryFileStorageService(
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.cloudinary.api-key}") String apiKey,
            @Value("${app.cloudinary.api-secret}") String apiSecret,
            @Value("${app.cloudinary.folder:techblog}") String folder) {
        this(cloudName, apiKey, apiSecret, folder, HttpClient.newHttpClient(), Clock.systemUTC());
    }

    CloudinaryFileStorageService(
            String cloudName,
            String apiKey,
            String apiSecret,
            String folder,
            HttpClient httpClient,
            Clock clock) {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new IllegalStateException("Cloudinary credentials (cloudName, apiKey, apiSecret) must not be blank");
        }
        this.cloudName = cloudName.trim();
        this.apiKey = apiKey.trim();
        this.apiSecret = apiSecret.trim();
        this.folder = folder == null ? "" : folder.trim();
        this.httpClient = httpClient;
        this.clock = clock;
    }

    @Override
    public FileUploadResponse storeFile(MultipartFile file) {
        String extension = FileStorageService.validateAndExtractImageExtension(file);
        long timestamp = clock.instant().getEpochSecond();
        String signature = generateSignature(folder, timestamp, apiSecret);
        String boundary = "----TechBlogBoundary" + UUID.randomUUID().toString().replace("-", "");

        try {
            byte[] multipartBody = buildMultipartBody(boundary, file, extension, timestamp, signature);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(CLOUDINARY_UPLOAD_URL_TEMPLATE, cloudName)))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Upload ảnh lên Cloudinary thất bại (HTTP " + response.statusCode() + "): " + response.body());
            }

            JsonNode root = OBJECT_MAPPER.readTree(response.body());
            String secureUrl = root.path("secure_url").asString("");
            if (secureUrl.isBlank()) {
                throw new RuntimeException("Cloudinary không trả về secure_url hợp lệ!");
            }

            String publicId = root.path("public_id").asString("");
            String resolvedName = publicId.isBlank() ? UUID.randomUUID() + extension : publicId;

            return FileUploadResponse.builder()
                    .fileName(resolvedName)
                    .fileUrl(secureUrl)
                    .fileType(file.getContentType())
                    .size(file.getSize())
                    .build();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Quá trình upload ảnh lên Cloudinary bị gián đoạn!", ex);
        } catch (IOException ex) {
            throw new RuntimeException("Lỗi kết nối khi upload ảnh lên Cloudinary!", ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        throw new ResourceNotFoundException("File được lưu trên Cloudinary, vui lòng truy cập trực tiếp qua URL ảnh.");
    }

    static String generateSignature(String folder, long timestamp, String apiSecret) {
        TreeMap<String, String> params = new TreeMap<>();
        if (folder != null && !folder.isBlank()) {
            params.put("folder", folder.trim());
        }
        params.put("timestamp", String.valueOf(timestamp));

        StringBuilder payload = new StringBuilder();
        params.forEach((key, value) -> {
            if (!payload.isEmpty()) {
                payload.append('&');
            }
            payload.append(key).append('=').append(value);
        });
        payload.append(apiSecret);

        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            byte[] digest = sha1.digest(payload.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-1 algorithm unavailable", ex);
        }
    }

    private byte[] buildMultipartBody(
            String boundary,
            MultipartFile file,
            String extension,
            long timestamp,
            String signature) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        writeFormField(out, boundary, "api_key", apiKey);
        if (!folder.isBlank()) {
            writeFormField(out, boundary, "folder", folder);
        }
        writeFormField(out, boundary, "timestamp", String.valueOf(timestamp));
        writeFormField(out, boundary, "signature", signature);

        String originalFilename = file.getOriginalFilename();
        String safeFilename = (originalFilename == null || originalFilename.isBlank())
                ? "upload" + extension
                : originalFilename.replace("\"", "");
        String contentType = (file.getContentType() == null || file.getContentType().isBlank())
                ? "application/octet-stream"
                : file.getContentType();

        out.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + safeFilename + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(file.getBytes());
        out.write("\r\n".getBytes(StandardCharsets.UTF_8));
        out.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        return out.toByteArray();
    }

    private static void writeFormField(ByteArrayOutputStream out, String boundary, String name, String value) throws IOException {
        out.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(value.getBytes(StandardCharsets.UTF_8));
        out.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
