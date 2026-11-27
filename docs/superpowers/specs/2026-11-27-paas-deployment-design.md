# Thiết kế triển khai PaaS (Cách A: Vercel + Render/Railway + Neon DB + Cloudinary)

**Ngày:** 2026-11-27  
**Mục tiêu:** Chuẩn bị toàn bộ cấu hình Frontend, Backend và lưu trữ ảnh Cloud (Cloudinary) để deploy `TechBlog` lên môi trường production (PaaS) phục vụ người dùng thật và đưa vào CV.

---

## 1. Kiến trúc & Lựa chọn kỹ thuật

* **Mô hình kết nối (Cách A)**: Frontend React/Vite host trên **Vercel**, gọi trực tiếp tới Backend Spring Boot trên **Render/Railway** thông qua `VITE_API_URL` và danh sách CORS whitelist (`app.cors.allowed-origins`).
* **Database**: PostgreSQL trên **Neon DB** (`sslmode=require`).
* **Lưu trữ ảnh (Hybrid Storage - Strategy Pattern)**:
  * Tách `FileStorageService` thành interface với 2 implementation chọn bằng `@ConditionalOnProperty(name = "app.storage.type", ...)`:
    * `LocalFileStorageService` (`local`, `matchIfMissing = true`): giữ nguyên hành vi lưu vào thư mục local `uploads/` khi chạy dev.
    * `CloudinaryFileStorageService` (`cloudinary`): gọi trực tiếp **Cloudinary Upload REST API** (`/v1_1/{cloudName}/image/upload`) kèm chữ ký SHA-1 bằng `java.net.http.HttpClient` tích hợp sẵn trong JDK 17 (tránh phụ thuộc SDK ngoài gây xung đột với Spring Boot 4.1.1), trả về `secure_url` HTTPS.

## 2. Quy tắc bảo mật & cấu hình Production

* **Không có fallback secret/password mặc định** trong `application-prod.properties` và trong `DataInitializer` khi profile `prod` hoạt động:
  * `application-prod.properties` dùng placeholder bắt buộc (`${SPRING_DATASOURCE_URL}`, `${SPRING_DATASOURCE_USERNAME}`, `${SPRING_DATASOURCE_PASSWORD}`, `${APP_JWT_SECRET}`, `${APP_CORS_ALLOWED_ORIGINS}`, `${APP_ADMIN_EMAIL}`, `${APP_ADMIN_PASSWORD}`, `${CLOUDINARY_CLOUD_NAME}`, `${CLOUDINARY_API_KEY}`, `${CLOUDINARY_API_SECRET}`) để Spring Boot fail-fast nếu thiếu biến môi trường khi chạy `prod`.
  * `DataInitializer`: khi profile `prod` active, yêu cầu `app.admin.email` và `app.admin.password` không được rỗng và không dùng giá trị mặc định `admin123` (dev profile vẫn giữ mặc định để không gãy luồng local dev).
* **Swagger / OpenAPI**: mặc định tắt trên profile `prod` (`springdoc.api-docs.enabled=${SPRINGDOC_ENABLED:false}`, `springdoc.swagger-ui.enabled=${SPRINGDOC_ENABLED:false}`).
* **Proxy & Port**: bật `server.port=${PORT:8080}` và `server.forward-headers-strategy=framework`.

## 3. Phạm vi thay đổi theo file

1. `frontend/vercel.json`: SPA rewrite `/(.*) -> /index.html`.
2. `frontend/index.html`: cập nhật `<title>` thành `TechBlog Academy`.
3. `frontend/src/pages/AdminDashboardPage.tsx`: bỏ hardcode `http://localhost:8080` khi nhận `res.fileUrl` (hỗ trợ URL đầy đủ từ Cloudinary hoặc suy ra origin từ `VITE_API_URL`).
4. `backend/src/main/resources/application-prod.properties`: cấu hình profile `prod` không fallback secret/password.
5. `backend/src/main/java/com/example/TechBlog/config/SecurityConfig.java`: đọc `app.cors.allowed-origins` từ cấu hình.
6. `backend/src/main/java/com/example/TechBlog/config/DataInitializer.java`: đọc `app.admin.email` & `app.admin.password` từ cấu hình; chặn giá trị rỗng hoặc mật khẩu mặc định yếu khi chạy profile `prod`.
7. `backend/src/main/java/com/example/TechBlog/service/FileStorageService.java`, `LocalFileStorageService.java`, `CloudinaryFileStorageService.java`: tái cấu trúc theo Strategy Pattern (`@ConditionalOnProperty`) + unit test cho cả local storage và Cloudinary REST upload.
8. `.env.example`: mẫu biến môi trường cho Backend & Frontend.

## 4. Quy tắc Git

* Commit riêng từng bước nhỏ theo đúng file vừa sửa/tạo (giữ nguyên các file đang xóa trong `.agent/`, không stage `.agent/`).
* Verify toàn bộ (backend unit tests + `mvn test-compile` / `mvnw test` với phạm vi không phụ thuộc DB ngoài nếu chưa bật Postgres, và `frontend` `npm run lint` + `npm run build`), sau đó `git push` 1 lần lên `origin/main`.
