# Phụ lục — Nhật ký hỗ trợ AI (Cursor Agent)

**Dự án:** mac-lenin-web (Mác – Lênin)  
**Công cụ AI:** Cursor IDE — Agent  
**Mục đích:** Ghi lại các bước khởi tạo và phát triển có hỗ trợ AI.

---

## 1. Tổng quan

| Hạng mục | Chi tiết |
|----------|----------|
| Stack khởi tạo | HTML, CSS, JavaScript (ES modules), không build bắt buộc |
| Bảng màu | White `#FFFFFF`, Deep Red `#850101`, Canary `#ffff99`, Dark Brown `#4c3228` |
| Tab | Nội dung chính · Phụ lục AI · Chat box |
| Vị trí project | `thePrototype/mac-lenin-web/` (folder riêng, không ghi thẳng vào root workspace) |

---

## 2. Nhật ký theo thời gian

### Mục 2.1 — Khởi tạo khung web và màu sắc

**Yêu cầu người dùng:**

- Tạo web nội dung Mác – Lênin với 3 tab: nội dung chính, phụ lục AI, chat box.
- Ghi log trong folder `doc/`.
- Dùng bảng màu từ ảnh (Deep Red, Canary, Dark Brown, nền trắng).
- Tạo **project folder riêng**, không ghi thẳng vào folder gốc thePrototype.
- Chỉ khởi tạo khung trước; nội dung bổ sung sau.

**Hành động AI:**

| Thành phần | Mô tả |
|------------|--------|
| `index.html` | Header, tab bar, 3 panel, footer |
| `css/variables.css`, `css/main.css` | Biến màu + layout responsive |
| `js/tabs.js`, `content-loader.js`, `chat.js`, `app.js` | Tab, tải Markdown từ `content/`, chat localStorage + xuất `.md` |
| `content/*.md` | Placeholder nội dung chính & phụ lục |
| `doc/phu-luc-log-ai.md` | File nhật ký này |

**Kết quả:**

- Chạy bằng server tĩnh (`npx serve .`) vì `fetch` content cần HTTP (không mở file:// trực tiếp).
- Chat: demo phản hồi placeholder; sẵn sàng nối API sau.
- Người dùng chỉnh `content/noi-dung-chinh.md` và `content/phu-luc-ai.md` để cập nhật bài.

**File liên quan:** toàn bộ thư mục `mac-lenin-web/`

---

*Các mục tiếp theo: thêm khi bạn hoặc AI thực hiện bước mới — ghi tiếp dưới đây theo mẫu Mục 2.x.*
