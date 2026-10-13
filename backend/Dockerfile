# ==========================================
# GIAI ĐOẠN 1: BUILD ỨNG DỤNG VỚI MAVEN
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy file pom.xml và tải trước các dependency (tận dụng Docker cache để build nhanh hơn)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ mã nguồn và đóng gói thành file .jar (bỏ qua chạy test để tiết kiệm thời gian)
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# GIAI ĐOẠN 2: CHẠY ỨNG DỤNG SIÊU NHẸ (JRE)
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Tạo thư mục uploads trong container để lưu trữ file tải lên
RUN mkdir -p /app/uploads

# Copy duy nhất file .jar từ giai đoạn build sang
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 của container
EXPOSE 8080

# Lệnh khởi chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
