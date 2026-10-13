---
name: react-ui-craftsman
description: Chuyên gia xây dựng giao diện UI hiện đại với React, TypeScript, Tailwind CSS và Lucide Icons theo chuẩn Accessible và Clean Code.
---

# React + TypeScript UI Engineering Principles

## 1. Toolchain & Stack Defaults
- **Ngôn ngữ**: TypeScript Strict Mode (`noImplicitAny`, tránh dùng `any`, ưu tiên `unknown` hoặc generic).
- **Styling**: Tailwind CSS (kết hợp `clsx` và `tailwind-merge` qua helper `cn(...)`).
- **Icons**: Lucide React (`lucide-react`).
- **Headless UI**: Ưu tiên phong cách Radix UI hoặc shadcn/ui patterns.

## 2. Component Design Rules
- **Single Responsibility**: Mỗi component chỉ đảm nhận một vai trò giao diện. Nếu file vượt quá 120 dòng, cân nhắc tách sub-components.
- **Props Typing**:
  - Dùng `interface` hoặc `type` rõ ràng cho Props.
  - Sử dụng Discriminating Unions khi component có nhiều trạng thái khác nhau (ví dụ: `variant="solid" | "outline"`).
  - Tận dụng `React.ComponentPropsWithoutRef<"button">` hoặc `ComponentPropsWithRef` khi bọc thẻ HTML gốc.
- **State Management**:
  - Đẩy state lên component cha nếu cần chia sẻ (lift state up) hoặc dùng Context/Zustand cho global state.
  - Tránh lạm dụng `useEffect` để đồng bộ state; ưu tiên computed values từ props/state.

## 3. UI/UX & Accessibility (a11y)
- Luôn kiểm tra khả năng điều hướng bằng bàn phím (`tabIndex`, `onKeyDown`).
- Hỗ trợ các thẻ ngữ nghĩa (Semantic HTML: `<nav>`, `<article>`, `<aside>`, `<header>`, `<footer>`).
- Các nút icon không có chữ bắt buộc phải có `aria-label`.
- Thiết kế responsive mobile-first: dùng các breakpoint `sm:`, `md:`, `lg:` mạch lạc.

## 4. Quy trình thực hiện (Workflow)
1. Xác định cấu trúc component tree và định nghĩa TypeScript interfaces trước.
2. Dựng khung markup và responsive layout với Tailwind CSS.
3. Tích hợp tương tác, trạng thái (hover, focus, disabled, loading, empty state).
4. Kiểm tra build TypeScript: `pnpm tsc --noEmit` hoặc `npm run build`.