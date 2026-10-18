# 🚀 TechBlog - Nền Tảng Học Lập Trình & Blog Công Nghệ Fullstack

> Hệ thống E-Learning & Tech Blog hoàn chỉnh được xây dựng theo chuẩn kiến trúc doanh nghiệp với **Java Spring Boot**, **React TypeScript**, **PostgreSQL** và **Docker**.

---

## 🌟 Giới thiệu tổng quan

**TechBlog** là nền tảng học trực tuyến và chia sẻ kiến thức công nghệ hiện đại, cung cấp trải nghiệm học tập chuẩn mực như F8 / Udemy kết hợp không gian đọc blog kỹ thuật chuyên sâu như Medium / Dev.to.

Hệ thống được thiết kế theo kiến trúc phân tầng sạch (Clean Layered Architecture), tối ưu hóa hiệu năng với cơ chế Server-side Search & Filter, bảo mật bằng Spring Security JWT và đóng gói container hóa toàn diện với Docker Compose.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend
- **Ngôn ngữ & Framework**: Java 17+, Spring Boot (3.x / 4.x)
- **Truy cập dữ liệu**: Spring Data JPA, Hibernate 7, `JpaSpecificationExecutor` (Criteria API dynamic queries)
- **Bảo mật**: Spring Security 6, JWT (JSON Web Token) Stateless Authentication
- **Cơ sở dữ liệu**: PostgreSQL 16 (kết nối qua HikariCP)
- **Tài liệu API**: SpringDoc OpenAPI 3 / Swagger UI
- **Công cụ build**: Maven Wrapper (`./mvnw`)

### Frontend
- **Thư viện cốt lõi**: React 19, TypeScript (Strict Mode)
- **Công cụ build**: Vite 8 (Hot Module Replacement / Fast Refresh)
- **Giao diện & Styling**: Tailwind CSS v4, Lucide React Icons
- **HTTP Client**: Axios (với Request/Response Interceptors đính kèm JWT)
- **Hiển thị nội dung đa phương tiện**:
  - `react-markdown` + `remark-gfm`: Hỗ trợ đầy đủ cú pháp Markdown, bảng biểu, danh sách.
  - `prismjs`: Highlight cú pháp mã nguồn (Java, TypeScript, Python, SQL...) phong cách macOS với nút Copy 1-click.
  - YouTube Auto-Embed: Tự động nhận diện link video YouTube và nhúng player 16:9 responsive.

### DevOps & Triển khai
- **Docker & Docker Compose**: Điều phối đồng thời 3 tầng (Database, Backend, Frontend).
- **Multi-stage Dockerfile**:
  - Backend: Maven Builder $\rightarrow$ Eclipse Temurin JRE Alpine siêu nhẹ (~150MB).
  - Frontend: Node Builder $\rightarrow$ Nginx 1.27 Alpine.
- **Nginx Reverse Proxy**: Tự động chuyển tiếp `/api/*` tới backend, hỗ trợ SPA Routing fallback (`try_files`), bật nén Gzip và giải quyết triệt để lỗi CORS.

---

## 🎯 Tính năng nổi bật

### 1. Quản lý Người dùng & Bảo mật (Auth & RBAC)
- Đăng ký tài khoản, Đăng nhập và cấp phát JWT token.
- Phân quyền theo vai trò (Role-Based Access Control): `ROLE_USER` và `ROLE_ADMIN`.
- Đổi mật khẩu an toàn với xác thực mật khẩu hiện tại và kiểm tra độ khớp.
- Quản trị viên có thể xem danh sách người dùng và gán/hủy quyền Admin trực quan trên Dashboard.

### 2. Quản lý Khóa học & Phòng học trực tuyến (LMS)
- **Tìm kiếm & Lọc Server-side**:
  - Tìm kiếm theo từ khóa trong tiêu đề/mô tả với cơ chế Debounce (300ms).
  - Lọc theo danh mục chuyên đề (Frontend, Backend, DevOps...).
  - Lọc theo học phí: *Tất cả*, *Miễn phí*, *Có phí*.
  - Sắp xếp linh hoạt: Mới nhất, Cũ nhất, Giá tăng/giảm dần, Tên A-Z.
- **Ghi danh & Tiến độ học tập**:
  - Học viên ghi danh khóa học để mở khóa toàn bộ bài giảng.
  - Chức năng học thử bài giảng đầu tiên trước khi đăng ký.
  - Tự động tính toán thanh tiến độ (% hoàn thành) và đếm số bài đã học.
  - Đánh dấu hoàn thành / chưa hoàn thành bài học, tự động chuyển bài tiếp theo.
- **Nội dung bài học Rich Content**:
  - Hỗ trợ xem video YouTube nhúng trực tiếp trong bài giảng.
  - Đoạn code minh họa có highlight cú pháp đa ngôn ngữ và nút sao chép tiện lợi.

### 3. Blog Kỹ thuật & Tương tác
- Đọc bài viết công nghệ với trình bày chuẩn Markdown chuyên nghiệp.
- Tìm kiếm bài viết theo từ khóa và phân loại theo chủ đề.
- Hệ thống bình luận thời gian thực dưới mỗi bài viết.

### 4. Bảng điều khiển Quản trị (Admin Dashboard)
- Quản trị toàn diện Khóa học, Bài học, Bài viết, Danh mục và Người dùng.
- Tải lên hình ảnh (Thumbnail/Avatar) với cơ chế lưu trữ thư mục volume an toàn.

---

## 🏗️ Kiến trúc hệ thống Docker (3-Tier)

```
[ Trình duyệt / Client ] ──► http://localhost:3000 (hoặc http://localhost:80)
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       Container Frontend (Nginx 1.27 Alpine)     │
             │   - Nén Gzip, phục vụ file tĩnh SPA (React Vite) │
             │   - Định tuyến client-side: fallback index.html  │
             └────────────────────────┬─────────────────────────┘
                                      │  Reverse Proxy (/api/*)
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │      Container Backend (Spring Boot / JRE 17)    │
             │   - Xử lý REST API, Spring Security, JWT, JPA    │
             │   - Lưu trữ ảnh/file ra volume host ./uploads    │
             └────────────────────────┬─────────────────────────┘
                                      │  Port 5432 nội bộ
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │     Container Database (PostgreSQL 16 Alpine)    │
             │   - Lưu trữ dữ liệu với persistent volume        │
             │   - Healthcheck tự động (pg_isready)             │
             └──────────────────────────────────────────────────┘
```

---

## ⚡ Hướng dẫn cài đặt & Chạy ứng dụng

Bạn có thể chạy dự án theo một trong hai cách dưới đây:

### Cách 1: Khởi động 1-Click bằng Docker Compose (Khuyên dùng)

> **Yêu cầu**: Máy tính đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. **Clone mã nguồn dự án**:
   ```bash
   git clone https://github.com/VuongDuongg/TechBlog.git
   cd TechBlog
   ```

2. **Khởi động toàn bộ hệ thống bằng 1 lệnh duy nhất**:
   ```bash
   docker compose up -d --build
   ```

3. **Kiểm tra trạng thái các container**:
   ```bash
   docker compose ps
   ```

4. **Truy cập ứng dụng**:
   - **Giao diện Web**: [http://localhost:3000](http://localhost:3000) (hoặc [http://localhost](http://localhost))
   - **Swagger API Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **PostgreSQL**: `localhost:5433` (User: `postgres` | Password: `password` | Database: `course_blog`)

5. **Dừng hệ thống khi không sử dụng**:
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy thủ công trên môi trường phát triển (Local Dev)

> **Yêu cầu**: Đã cài đặt JDK 17+, Node.js 18+, Docker (để chạy PostgreSQL).

#### Bước 1: Khởi động Cơ sở dữ liệu PostgreSQL
```bash
docker run -d --name techblog-postgres \
  -e POSTGRES_DB=course_blog \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  postgres:16-alpine
```

#### Bước 2: Chạy Backend Spring Boot
Mở cửa sổ terminal thứ nhất:
```bash
cd backend
./mvnw spring-boot:run
```
*(Backend sẽ khởi động tại cổng `http://localhost:8080` và tự động tạo tài khoản Admin mặc định).*

#### Bước 3: Chạy Frontend React Vite
Mở cửa sổ terminal thứ hai:
```bash
cd frontend
npm install
npm run dev
```
*(Frontend sẽ khởi động tại cổng `http://localhost:5173`).*

---

## 🔑 Tài khoản mặc định hệ thống

Sau khi khởi động lần đầu, hệ thống tự động khởi tạo sẵn tài khoản quản trị:

| Tài khoản | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@example.com` | `admin123` | Toàn quyền quản trị hệ thống (`ROLE_ADMIN`, `ROLE_USER`) |
| **Học viên mẫu (User)** | Tự đăng ký qua trang `/register` | Mật khẩu tùy chọn | Học viên (`ROLE_USER`) |

---

## 📂 Cấu trúc thư mục dự án

```text
TechBlog/
├── .agent/                             # Bộ kỹ năng AI Agent độc lập (Clean Architecture Skills)
│   ├── rules/
│   │   └── fullstack-standards.md      # Quy tắc kỹ thuật cốt lõi chuẩn dự án
│   └── skills/
│       ├── spring-boot-jpa-craftsman/  # Mẫu thiết kế JPA, Specification, Security
│       ├── react-ts-craftsman/         # Quy chuẩn React, Vite Fast Refresh, Tailwind
│       ├── fullstack-java-react-workflow/ # Quy trình 5 bước phát triển tính năng
│       └── docker-compose-devops-master/  # Tiêu chuẩn đóng gói Docker & Nginx
├── backend/                            # Mã nguồn Backend Spring Boot
│   ├── src/main/java/com/example/TechBlog/
│   │   ├── config/                     # Cấu hình Security, JWT, File Upload, Sample Data
│   │   ├── controller/                 # REST Controllers (Auth, Course, Post, User...)
│   │   ├── dto/                        # Request & Response Data Transfer Objects
│   │   ├── entity/                     # JPA Entities (User, Role, Course, Lesson...)
│   │   ├── exception/                  # Global Exception Handling (@RestControllerAdvice)
│   │   ├── repository/                 # Spring Data JPA Repositories (JpaSpecificationExecutor)
│   │   └── service/                    # Business Logic Layer
│   ├── Dockerfile                      # Multi-stage Dockerfile cho Spring Boot
│   └── pom.xml                         # Maven dependencies & plugins
├── frontend/                           # Mã nguồn Frontend React TypeScript
│   ├── src/
│   │   ├── api/                        # Axios Client & Services (services.ts, axiosClient.ts)
│   │   ├── components/                 # Reusable UI Components (ContentRenderer, Pagination...)
│   │   ├── context/                    # Auth Context & State Management
│   │   ├── pages/                      # Các trang giao diện (Courses, Posts, Learning, Admin...)
│   │   └── types/                      # TypeScript Interfaces ánh xạ từ Backend DTOs
│   ├── Dockerfile                      # Multi-stage Dockerfile cho React & Nginx
│   ├── nginx.conf                      # Cấu hình Nginx Reverse Proxy, Gzip & SPA fallback
│   └── package.json                    # Dependencies (React 19, Tailwind v4, Vite 8)
├── uploads/                            # Thư mục lưu trữ hình ảnh tải lên (Persistent Volume)
├── docker-compose.yml                  # File điều phối khởi động toàn bộ hệ thống
└── README.md                           # Tài liệu hướng dẫn dự án
```

---

## 🛡️ Giấy phép & Tác giả

- **Tác giả**: [VuongDuongg](https://github.com/VuongDuongg)
- **Mã nguồn**: Phát triển cho mục đích học tập, nghiên cứu và trình diễn kỹ năng Fullstack / DevOps.
