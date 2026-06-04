# Mác – Lênin Web

Website nội dung Mác – Lênin với 3 khu vực: **Nội dung chính**, **Phụ lục AI**, và **Chat box**.

## Bảng màu

| Tên | Mã màu | Dùng cho |
|-----|--------|----------|
| White | `#FFFFFF` | Nền trang, vùng đọc |
| Deep Red | `#850101` | Header, tab active, nút chính |
| Canary | `#ffff99` | Nhấn mạnh, hover tab, badge |
| Dark Brown | `#4c3228` | Chữ, viền, footer |

## Chạy local

Cần [Bun](https://bun.sh) (v1.0+). Trong thư mục project:

```bash
bun install   # lần đầu (không có dependency ngoài, chỉ khởi tạo lockfile)
bun run dev
```

Truy cập `http://localhost:3000`. Đổi port: `PORT=4000 bun run dev` (PowerShell: `$env:PORT=4000; bun run dev`).

Có thể mở trực tiếp `index.html`, nhưng tab nội dung cần server để tải file `.md` trong `content/`.

## Cấu trúc

```
mac-lenin-web/
├── index.html          # Trang chính
├── css/                # Biến màu + giao diện
├── js/                 # Tab, chat, tải nội dung
├── content/            # Bạn bổ sung nội dung (.md / .html)
├── data/               # Dữ liệu JSON (tùy chọn sau)
└── doc/                # Nhật ký AI & xuất log chat
```

## Bổ sung nội dung

1. **Nội dung chính:** chỉnh `content/noi-dung-chinh.md` (Markdown) hoặc `content/noi-dung-chinh.html`
2. **Phụ lục AI:** chỉnh `content/phu-luc-ai.md` hoặc `content/phu-luc-ai.html`
3. **Chat:** tab Chat box nối **CNXH Chapter 6 Chat API** (Ollama phía backend).

## Chat API (Frontend)

| Mục | Giá trị mặc định |
|-----|------------------|
| Base URL | `http://localhost:5000` |
| Health | `GET /health` |
| Gửi tin | `POST /api/ai/chat` |
| Lịch sử | `GET /api/ai/history/:sessionId` |
| Xóa phiên | `DELETE /api/ai/history/:sessionId` |

**Đổi địa chỉ API:**

- Biến môi trường `MAC_LENIN_API_BASE` (xem `.env.example`) — inject lúc `bun run build` và khi `bun run dev`
- Trên **Netlify:** Site settings → Environment variables → `MAC_LENIN_API_BASE=https://xxxx.ngrok-free.dev` rồi redeploy
- Hoặc mở trang kèm query: `?api=http://192.168.1.10:5000` (lưu vào localStorage, ưu tiên cao nhất)
- Ngrok: header `ngrok-skip-browser-warning` được thêm tự động khi URL có `ngrok`

## Deploy Netlify

```bash
bun run build   # tạo thư mục dist/ với API base từ env
```

`netlify.toml` đã cấu hình `command = "bun run build"` và `publish = "dist"`. Trên Netlify chỉ cần thêm biến `MAC_LENIN_API_BASE` trỏ tới backend public (ngrok hoặc server thật).

**Chạy thử:**

1. Backend: `bun run dev` tại repo API (port 5000)
2. Frontend: `bun run dev` (port 3000)
3. Tab **Chat box** — trạng thái “Đã kết nối” khi `GET /health` OK

`sessionId` lưu trong `localStorage` (`mac-lenin-chat-session-id`). F5 sẽ tải lại lịch sử từ server.

## Nhật ký phát triển

Xem thư mục [`doc/`](./doc/).
