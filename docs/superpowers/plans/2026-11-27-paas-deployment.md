# PaaS Deployment Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn bị toàn bộ cấu hình Frontend (Vercel), Backend (Render/Railway + Neon DB) và Hybrid File Storage (Local + Cloudinary REST API theo Strategy Pattern) để deploy dự án TechBlog lên môi trường production thật cho CV.

**Architecture:** Frontend trên Vercel gọi trực tiếp Backend qua `VITE_API_URL` (Cách A) kèm `vercel.json` xử lý SPA fallback. Backend bổ sung profile `prod` fail-fast (không có secret/password fallback), CORS & Admin config đọc từ biến môi trường, và tách `FileStorageService` thành interface với 2 strategy bean (`local` và `cloudinary`) điều khiển qua `@ConditionalOnProperty`.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Spring Boot 4.1.1, Java 17, Spring Security 6, `java.net.http.HttpClient`, Jackson 3 (`tools.jackson.databind`), JUnit 5, Mockito.

**Spec:** `docs/superpowers/specs/2026-11-27-paas-deployment-design.md`

## Global Constraints

- Không được sửa hoặc stage các file đang ở trạng thái deleted trong `.agent/`.
- Mỗi bước hoàn thành 1 file/nhóm nhỏ chỉ `git add <tệp cụ thể>` và `git commit` ở local; chỉ `git push` 1 lần lên `origin/main` sau khi verify toàn bộ.
- Profile `prod` tuyệt đối không chứa fallback secret/password mặc định trong `application-prod.properties` hoặc `DataInitializer`.
- Giao tiếp Cloudinary dùng REST Upload API trực tiếp + chữ ký SHA-1 bằng JDK `HttpClient`, không thêm dependency Cloudinary SDK vào `pom.xml`.

## Review Focus

- Thiếu biến môi trường khi bật profile `prod` (`SPRING_PROFILES_ACTIVE=prod`) phải fail-fast lúc khởi động, không âm thầm fallback về `admin123` hay JWT secret dev.
- Tên file upload độc hại chứa `..` hoặc đuôi file không hợp lệ (`.exe`, `.svg`, không có đuôi) phải bị từ chối trước khi ghi disk hoặc gửi lên Cloudinary.
- URL ảnh upload khi Frontend cấu hình `VITE_API_URL` chứa `/api` và Backend trả URL tương đối (`/api/files/...`) không được gắn cứng `http://localhost:8080`, và URL HTTPS từ Cloudinary giữ nguyên nguyên vẹn.
- Chữ ký SHA-1 gửi tới Cloudinary phải sort tham số theo thứ tự chữ cái (`folder`, `timestamp`) trước khi nối `apiSecret` để tránh lỗi `401 Invalid Signature`.
- Danh sách CORS `app.cors.allowed-origins` có khoảng trắng hoặc dấu phẩy dư phải được trim sạch để không làm hỏng cấu hình Spring Security.

---

### Task 1: Thêm `frontend/vercel.json` cho SPA Routing

**Files:**
- Create: `frontend/vercel.json`

**Interfaces:**
- Produces: Vercel rewrite rule `/(.*) -> /index.html`.

- [ ] **Step 1: Tạo file `frontend/vercel.json`**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- [ ] **Step 2: Kiểm tra cú pháp JSON & build frontend**

Run: `node -e "JSON.parse(require('fs').readFileSync('frontend/vercel.json','utf8')); console.log('VALID_JSON')"`
Expected: `VALID_JSON`

- [ ] **Step 3: Commit local**

```powershell
git add frontend/vercel.json
git commit -m "chore(frontend): add vercel.json SPA rewrite config"
```

---

### Task 2: Cập nhật tiêu đề trang web trong `frontend/index.html`

**Files:**
- Modify: `frontend/index.html:7`

- [ ] **Step 1: Cập nhật `<title>` từ `frontend` thành `TechBlog Academy`**
- [ ] **Step 2: Verify Vite build**

Run: `cd frontend; npm run build`
Expected: exit code 0, `dist/index.html` chứa `TechBlog Academy`.

- [ ] **Step 3: Commit local**

```powershell
git add frontend/index.html
git commit -m "chore(frontend): update page title to TechBlog Academy"
```

---

### Task 3: Bỏ hardcode `localhost:8080` và `admin@example.com` trong `frontend/src/pages/AdminDashboardPage.tsx`

**Files:**
- Modify: `frontend/src/pages/AdminDashboardPage.tsx:38,1037-1040,1200-1203`

- [ ] **Step 1: Thêm helper `resolveUploadedFileUrl(fileUrl: string)` và đọc `VITE_ROOT_ADMIN_EMAIL` trong `AdminDashboardPage.tsx`**
  - `ROOT_ADMIN_EMAIL = import.meta.env.VITE_ROOT_ADMIN_EMAIL || 'admin@example.com'`
  - Nếu `fileUrl` bắt đầu bằng `http://` hoặc `https://` → trả về nguyên vẹn.
  - Nếu là đường dẫn tương đối (vd `/api/files/...`) → ghép với origin của `VITE_API_URL` (loại bỏ hậu tố `/api` nếu có) hoặc fallback `http://localhost:8080` chỉ khi `!import.meta.env.PROD`.
- [ ] **Step 2: Verify lint và TypeScript build**

Run: `cd frontend; npm run lint; npm run build`
Expected: both exit code 0.

- [ ] **Step 3: Commit local**

```powershell
git add frontend/src/pages/AdminDashboardPage.tsx
git commit -m "fix(frontend): remove hardcoded localhost upload URL and admin email"
```

---

### Task 4: Tạo `backend/src/main/resources/application-prod.properties` chuẩn Production (không fallback secret)

**Files:**
- Create: `backend/src/main/resources/application-prod.properties`

- [ ] **Step 1: Tạo `application-prod.properties` với biến môi trường bắt buộc (không default secret/password)**
  - `server.port=${PORT:8080}`
  - `server.forward-headers-strategy=framework`
  - `spring.datasource.url=${SPRING_DATASOURCE_URL}`
  - `spring.datasource.username=${SPRING_DATASOURCE_USERNAME}`
  - `spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}`
  - `spring.jpa.show-sql=false`
  - `spring.jpa.properties.hibernate.format_sql=false`
  - `app.jwt.secret=${APP_JWT_SECRET}`
  - `app.jwt.expiration-ms=${APP_JWT_EXPIRATION_MS:86400000}`
  - `app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS}`
  - `app.admin.email=${APP_ADMIN_EMAIL}`
  - `app.admin.password=${APP_ADMIN_PASSWORD}`
  - `app.storage.type=cloudinary`
  - `app.cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}`
  - `app.cloudinary.api-key=${CLOUDINARY_API_KEY}`
  - `app.cloudinary.api-secret=${CLOUDINARY_API_SECRET}`
  - `app.cloudinary.folder=${CLOUDINARY_FOLDER:techblog}`
  - `springdoc.api-docs.enabled=${SPRINGDOC_ENABLED:false}`
  - `springdoc.swagger-ui.enabled=${SPRINGDOC_ENABLED:false}`
- [ ] **Step 2: Verify không còn fallback secret/password trong `application-prod.properties`**
- [ ] **Step 3: Commit local**

```powershell
git add backend/src/main/resources/application-prod.properties
git commit -m "chore(backend): add strict production profile configuration"
```

---

### Task 5: Cấu hình CORS động trong `SecurityConfig.java`

**Files:**
- Modify: `backend/src/main/java/com/example/TechBlog/config/SecurityConfig.java`
- Test: `backend/src/test/java/com/example/TechBlog/config/SecurityConfigTest.java`

- [ ] **Step 1: Viết failing test `SecurityConfigTest.java` kiểm tra parse `app.cors.allowed-origins` (nhiều domain cách nhau dấu phẩy + trim khoảng trắng)**
- [ ] **Step 2: Chạy test xác nhận RED (`./mvnw test -Dtest=SecurityConfigTest`)**
- [ ] **Step 3: Cập nhật `SecurityConfig.java` inject `@Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:4200}")` và tách helper parse origin**
- [ ] **Step 4: Chạy test xác nhận GREEN (`./mvnw test -Dtest=SecurityConfigTest`)**
- [ ] **Step 5: Commit local từng file nhỏ**

---

### Task 6: Cấu hình Admin qua biến môi trường & kiểm tra nghiêm ngặt ở `prod` (`DataInitializer.java` & `UserService.java`)

**Files:**
- Modify: `backend/src/main/java/com/example/TechBlog/config/DataInitializer.java`
- Modify: `backend/src/main/java/com/example/TechBlog/service/UserService.java`
- Test: `backend/src/test/java/com/example/TechBlog/config/DataInitializerTest.java`
- Test: `backend/src/test/java/com/example/TechBlog/service/UserServiceRootAdminTest.java`

- [ ] **Step 1: Viết failing tests cho `DataInitializer` (profile `prod` từ chối email/password rỗng hoặc `admin123`; profile non-prod dùng mặc định nếu cấu hình; khi truyền đủ email/password ở `prod` thì khởi tạo đúng)**
- [ ] **Step 2: Chạy test xác nhận RED**
- [ ] **Step 3: Cập nhật `DataInitializer.java` và `UserService.java` đọc `app.admin.email` & `app.admin.password` (không dùng default `admin123` khi profile `prod` active)**
- [ ] **Step 4: Chạy tests xác nhận GREEN**
- [ ] **Step 5: Commit local từng file nhỏ**

---

### Task 7: Tách `FileStorageService` theo Strategy Pattern (`local` & `cloudinary` REST API)

**Files:**
- Modify: `backend/src/main/java/com/example/TechBlog/service/FileStorageService.java` (chuyển thành interface)
- Create: `backend/src/main/java/com/example/TechBlog/service/LocalFileStorageService.java`
- Create: `backend/src/main/java/com/example/TechBlog/service/CloudinaryFileStorageService.java`
- Test: `backend/src/test/java/com/example/TechBlog/service/LocalFileStorageServiceTest.java`
- Test: `backend/src/test/java/com/example/TechBlog/service/CloudinaryFileStorageServiceTest.java`
- Test: `backend/src/test/java/com/example/TechBlog/service/FileStorageStrategySelectionTest.java`

**Interfaces:**
- `public interface FileStorageService`:
  - `FileUploadResponse storeFile(MultipartFile file)`
  - `Resource loadFileAsResource(String fileName)`

- [ ] **Step 1: Chuyển `FileStorageService` thành interface và tạo `LocalFileStorageService` (`@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)`) cùng test `LocalFileStorageServiceTest` (RED -> GREEN, bao gồm test chặn path traversal `..` và định dạng file không hợp lệ)**
- [ ] **Step 2: Viết failing test `CloudinaryFileStorageServiceTest` kiểm tra tính chữ ký SHA-1 (`folder=...&timestamp=...<apiSecret>`), kiểm tra multipart request & parse `secure_url` từ mock `HttpClient`, từ chối file rỗng/sai đuôi, xử lý lỗi API Cloudinary != 2xx**
- [ ] **Step 3: Implement `CloudinaryFileStorageService` (`@ConditionalOnProperty(name = "app.storage.type", havingValue = "cloudinary")`) và chạy test xác nhận GREEN**
- [ ] **Step 4: Viết test `FileStorageStrategySelectionTest` dùng `ApplicationContextRunner` xác nhận Spring chọn đúng bean `LocalFileStorageService` khi mặc định/`local` và `CloudinaryFileStorageService` khi `app.storage.type=cloudinary`**
- [ ] **Step 5: Commit local từng file nhỏ**

---

### Task 8: Thêm `.env.example` và cập nhật `application.properties` (nếu cần key non-secret)

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Tạo `.env.example` hướng dẫn rõ biến môi trường cho Backend (Render/Railway + Neon + Cloudinary) và Frontend (Vercel)**
- [ ] **Step 2: Commit local**

---

### Task 9: Verify toàn bộ, Code Review cuối nhánh & Push 1 lần lên `origin/main`

- [ ] **Step 1: Chạy toàn bộ test unit Backend + build/lint Frontend**
- [ ] **Step 2: Kiểm tra `git status` đảm bảo `.agent/` không bị stage/commit**
- [ ] **Step 3: Thực hiện review diff toàn bộ các commit mới**
- [ ] **Step 4: `git push origin main` 1 lần duy nhất sau khi mọi kiểm tra đều đạt**
