# ==========================================
# GIAI ĐOẠN 1: BUILD ỨNG DỤNG REACT + VITE
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json và cài đặt dependencies trước để tận dụng Docker layer caching
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend và build bundle production
COPY . .
RUN npm run build

# ==========================================
# GIAI ĐOẠN 2: CHẠY NGINX PHỤC VỤ TĨNH & REVERSE PROXY
# ==========================================
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Xóa cấu hình mặc định của Nginx và thay bằng cấu hình tối ưu của dự án
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy toàn bộ sản phẩm build từ Giai đoạn 1 sang thư mục web của Nginx
COPY --from=build /app/dist .

# Mở cổng 80 cho web
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
