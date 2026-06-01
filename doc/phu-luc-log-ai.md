# Phụ lục — Nhật ký hỗ trợ AI (Cursor Agent)

**Mục đích phụ lục:** Ghi lại các bước phát triển có sự hỗ trợ của AI, phục vụ minh bạch quy trình và báo cáo đồ án **MLN131**.

**Công cụ AI:** Cursor IDE — Agent; ChatGPT (tổng hợp / kiểm chứng nội dung học thuật).

---

# Phần A — Frontend: mac-lenin-web

**Dự án:** Website nội dung Mác – Lênin (vấn đề dân tộc) + chatbot Chương 6  
**Repository:** https://github.com/soloplayer345/mac-lenin-web

## A.1. Tổng quan

| Hạng mục | Chi tiết |
|----------|----------|
| Stack | HTML, CSS, JavaScript (ES modules), Bun dev server |
| Bảng màu | White `#FFFFFF`, Deep Red `#850101` / `#8B1E1E`, Canary `#ffff99`, Gold `#D4AF37` |
| Tab | Nội dung chính · Phụ lục AI · Chat box |
| Chat API | `POST /api/ai/chat` — backend CNXH Chapter 6 (Ollama) |
| Vị trí | `thePrototype/mac-lenin-web/` |

## A.2. Nhật ký theo thời gian

### Mục A.2.1 — Khởi tạo khung web và màu sắc

**Yêu cầu người dùng:**

- Tạo web nội dung Mác – Lênin với 3 tab: nội dung chính, phụ lục AI, chat box.
- Ghi log trong folder `doc/`.
- Dùng bảng màu Deep Red, Canary, Dark Brown, nền trắng.
- Tạo project folder riêng; chỉ khởi tạo khung trước.

**Hành động AI:**

| Thành phần | Mô tả |
|------------|--------|
| `index.html` | Header, tab bar, 3 panel, footer |
| `css/variables.css`, `css/main.css` | Biến màu + layout |
| `js/tabs.js`, `content-loader.js`, `chat.js`, `app.js` | Tab, tải Markdown, chat demo localStorage |
| `content/*.md`, `doc/phu-luc-log-ai.md` | Placeholder nội dung & nhật ký |

**Kết quả:** Khung web chạy qua server tĩnh; chat placeholder.

---

### Mục A.2.2 — Bổ sung nội dung chính (vấn đề dân tộc)

**Yêu cầu:** Thêm nội dung bài về đặc điểm dân tộc, quan điểm và chính sách Đảng, Nhà nước.

**Hành động AI:** Cập nhật `content/noi-dung-chinh.md`; chỉnh parser Markdown (`####`, section).

**Kết quả:** Tab Nội dung chính hiển thị đầy đủ mục 1 và 2.

---

### Mục A.2.3 — Bun dev server

**Yêu cầu:** Gắn Bun, chạy `bun run dev`.

**Hành động AI:** `package.json`, `dev-server.ts` (Bun.serve), cập nhật README.

**Kết quả:** `http://localhost:3000` — phục vụ file tĩnh và `.md`.

---

### Mục A.2.4 — Chỉnh typography và layout tham chiếu HCM202

**Yêu cầu:** Layout giống trang https://hcm-202-representation-group3-v1.vercel.app

**Hành động AI:**

| Thành phần | Mô tả |
|------------|--------|
| `index.html` | Nav sticky, hero full màn hình, section banner |
| `css/main.css`, `variables.css` | Nền kem `#F9F7F2`, Playfair + Be Vietnam Pro, card grid |
| `content-loader.js` | Render section + topic cards từ Markdown |

**Kết quả:** Giao diện landing + nội dung dạng thẻ.

---

### Mục A.2.5 — Tích hợp Chat API (CNXH Chapter 6)

**Yêu cầu:** Nối API theo tài liệu Frontend (`/api/ai/chat`, `sessionId`, timeout 120s).

**Hành động AI:**

| File | Mô tả |
|------|--------|
| `js/config.js` | Base URL, `?api=`, localStorage `sessionId` |
| `js/chat-api.js` | `checkHealth`, `sendChat`, `getHistory`, `deleteHistory` |
| `js/chat.js` | Luồng chat thật, trạng thái kết nối, xuất `.md` |

**Kết quả:** Chat box gọi backend `localhost:5000` (hoặc ngrok); lưu phiên hội thoại.

---

### Mục A.2.6 — Sửa hiển thị Markdown trong chat

**Vấn đề:** API trả Markdown nhưng FE escape HTML → lộ `**`, `*`, `---`.

**Hành động AI:** `js/markdown.js` — render đậm, nghiêng, list, `hr`; gộp xuống dòng lỗi.

**Kết quả:** Tin AI hiển thị định dạng đúng; tin người dùng vẫn plain text (an toàn).

---

### Mục A.2.7 — Cải thiện UI chat (bubble)

**Yêu cầu:** Giao diện chat đẹp hơn.

**Hành động AI:** Bubble trái/phải, avatar, composer bo tròn, panel “Hội thoại”.

**Kết quả:** UX kiểu messenger, đồng bộ theme đỏ–vàng.

---

### Mục A.2.8 — Đẩy repository GitHub

**Hành động:** `git init`, commit, `gh repo create` → **soloplayer345/mac-lenin-web** (public).

**Lưu ý bảo mật:** Không commit token; người dùng được nhắc revoke token nếu lỡ lộ.

---

### Mục A.2.9 — Bổ sung phụ lục AI (môn học + nhật ký)

**Yêu cầu:** Cập nhật `content/phu-luc-ai.md` (nguyên tắc MLN131) và mở rộng nhật ký `doc/` (file này).

**Kết quả:** Minh bạch công cụ ChatGPT + Cursor; liên kết nhật ký backend.

---

## A.3. Tóm tắt file frontend (AI tạo / sửa chính)

| Tạo mới | Chỉnh sửa |
|---------|-----------|
| `dev-server.ts`, `package.json` | `index.html`, `css/*`, `js/*` |
| `js/config.js`, `chat-api.js`, `markdown.js` | `content/noi-dung-chinh.md`, `content/phu-luc-ai.md` |
| — | `README.md`, `doc/phu-luc-log-ai.md` |

---

# Phần B — Backend: CNXH Chapter 6 Chat API

**Dự án:** CNXH Chapter 6 Chat API  
**Stack:** TypeScript, Express, Ollama, file JSON  
**Phạm vi AI hỗ trợ:** Swagger, Docker, README, tài liệu, tư vấn kiến trúc  
**Phạm vi không thay đổi bởi AI:** Logic chat, dataset Chương 6, prompt gốc

## B.1. Nhật ký theo thời gian

### Mục B.2.1 — Khám phá cách chạy project (Swagger & Bun)

**Yêu cầu:** Hỏi project có chạy Swagger không và dùng Bun.

**Phân tích AI:** Chưa có Swagger; có `bun.lock` → tương thích Bun.

**Kết quả:** `bun install`, `bun run dev`; test bằng curl/Postman; cần Ollama cho chat.

**File:** `package.json`, `src/app.ts`, `src/routes/ai.routes.ts`

---

### Mục B.2.2 — Xử lý lỗi port 5000 bị chiếm

**Yêu cầu:** Log `EADDRINUSE :::5000`.

**Hành động:** `netstat` → `taskkill` process `node.exe` cũ.

**Kết quả:** Tránh chạy trùng `dev`/`start` hoặc đổi `PORT` trong `.env`.

---

### Mục B.2.3 — Tích hợp Swagger UI

**Hành động AI:**

| File | Thay đổi |
|------|----------|
| `src/config/swagger.ts` | **Tạo mới** — OpenAPI 3.0 + Swagger UI |
| `src/app.ts` | Mount `/api-docs`, `/api-docs.json` |
| `src/server.ts` | In URL Swagger khi khởi động |
| `package.json` | `swagger-ui-express` |

**Kết quả:** `http://localhost:5000/api-docs`

---

### Mục B.2.4 — Làm rõ cơ chế lưu trữ dữ liệu

**Phân tích:** `chatHistory.service.ts` — ghi `chat-history.json`; không có DB quan hệ.

**Kết quả:** Persistence bằng file JSON tại `src/data/`.

---

### Mục B.2.5 — Tư vấn deploy nhiều người dùng

**Kết quả:** Đề xuất VPS + Ollama, Docker Compose; chưa sửa code.

---

### Mục B.2.6 — Docker Compose

**Hành động AI:**

| File | Thay đổi |
|------|----------|
| `Dockerfile`, `docker-compose.yml`, `docker/entrypoint.sh` | **Tạo mới** |
| `.dockerignore`, `.env.example`, `package.json` | Scripts `docker:up`, … |

**Kiến trúc:** `host:5000` → `api` → `ollama`; volumes `api_data`, `ollama_data`.

**Kết quả:** `docker compose up -d --build`

---

### Mục B.2.7 — Public internet bằng ngrok

**Kết quả:** `ngrok http 5000`; header `ngrok-skip-browser-warning` (FE đã hỗ trợ).

---

### Mục B.2.8 — README và thư mục phụ lục backend

| File | Thay đổi |
|------|----------|
| `README.md` | Hướng dẫn local, Docker, LAN, ngrok |
| `doc/README.md`, `doc/phu-luc-log-ai.md` | Phụ lục (phiên bản backend) |

---

## B.2. File backend do AI tạo / sửa

**Tạo mới:** `src/config/swagger.ts`, `Dockerfile`, `docker-compose.yml`, `docker/entrypoint.sh`, `.dockerignore`, `README.md`, `doc/*`

**Chỉnh sửa:** `src/app.ts`, `src/server.ts`, `package.json`, `.env.example`

**Không đổi (logic gốc):** `ai.service.ts`, `ollama.service.ts`, `dataset.service.ts`, `chuong_6_*_dataset.json`

---

# Phần C — Cam kết và checklist (báo cáo MLN131)

## Cam kết chung

> Trong quá trình hoàn thiện sản phẩm, nhóm **MLN131-gr1** có sử dụng **ChatGPT** (tổng hợp / kiểm chứng lý luận) và **Cursor Agent** (frontend, tích hợp API, giao diện, tài liệu). Logic chatbot, dataset Chương 6 và nội dung học thuật chính do nhóm biên soạn và kiểm chứng từ tài liệu chính thống. Nhóm chịu trách nhiệm về nội dung nộp bài.

**— MLN131-gr1 xin cam kết sử dụng AI có trách nhiệm và minh bạch —**

## Checklist sinh viên

- [ ] Đọc `content/phu-luc-ai.md` trên website (nguyên tắc 4 phần)
- [ ] Đọc nhật ký Phần A (frontend) và Phần B (backend) trong file này
- [ ] Chạy thử: `bun run dev` (FE port 3000) + API port 5000
- [ ] Test chat qua Swagger hoặc tab Chat box
- [ ] Kiểm chứng nội dung bài với giáo trình / văn bản chính thống
- [ ] Trích phụ lục vào báo cáo nếu giảng viên yêu cầu

---

*Tài liệu tổng hợp từ các phiên Cursor Agent — cập nhật khi bổ sung phụ lục MLN131 và nhật ký backend.*
