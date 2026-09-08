# BJT Prep

Web luyện thi **BJT — ビジネス日本語能力テスト** (Kỳ thi năng lực tiếng Nhật thương mại) dành cho người Việt.

## Trạng thái

**Stage A xong** — trang học viên, đăng nhập Google, màn thi nhiều phần, chấm điểm ở server có test.
**Stage B (nối Neon + Better Auth thật) đã viết code**, chờ có `DATABASE_URL` để migrate và kiểm thật.
Tiếp theo: Stage C — admin CRUD trên DB, Stage D — deploy Vercel. Cả ba việc cài đặt nằm ở `docs/setup.md`.

Không có `DATABASE_URL` thì app chạy trên `mock/`: đủ để dev giao diện và chạy test, nhưng đăng nhập không bền và không lưu bài làm.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Giai đoạn này **không cần database** — dữ liệu lấy từ `mock/`.

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest — scoring, quy tắc làm bài, chấm điểm, markdown, luồng nộp bài |
| `npm run db:generate` | Sinh Prisma Client (không cần DB) |
| `npm run db:migrate` | Tạo bảng (dev) — cần `DATABASE_URL_UNPOOLED` |
| `npm run db:migrate:deploy` | Áp migration lên production |
| `npm run db:seed` | Nạp dữ liệu cấu trúc — cần `DATABASE_URL` |
| `npm run db:seed:content` | Nạp nội dung mẫu từ `mock/` — chạy sau `db:seed` |
| `npm run db:studio` | Prisma Studio |

## Tài liệu

| File | Nội dung |
|---|---|
| `CLAUDE.md` | Quy ước dự án — **đọc trước khi viết dòng code đầu tiên** |
| `docs/setup.md` | Bật Neon · bật đăng nhập Google · deploy Vercel |
| `docs/versions.md` | Phiên bản thật và các quyết định kỹ thuật |

## Kiến trúc — điều quan trọng nhất

```
prisma/schema.prisma      nguồn sự thật về cấu trúc dữ liệu
mock/                     fixture nội dung, gõ kiểu theo type của Prisma
lib/data/                 tầng truy xuất — API công khai, chọn nguồn theo DATABASE_URL
  sources/mock/             không có DB (dev, test)
  sources/db/               có DB (production), cùng chữ ký
```

**Component không bао giờ import từ `mock/`.** Chỉ import từ `lib/data/`.
Hai nguồn bị ép cùng chữ ký bằng TypeScript, nên không component nào biết dữ liệu đến từ đâu.
