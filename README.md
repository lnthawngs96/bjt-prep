# BJT Prep

Web luyện thi **BJT — ビジネス日本語能力テスト** (Kỳ thi năng lực tiếng Nhật thương mại) dành cho người Việt.

## Trạng thái

**Phase 0 xong** — khung dự án, phiên bản đã chốt, hạ tầng DB dựng sẵn.
Đang làm: Phase 1 — nền tảng giao diện và các trang học viên.

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
| `npm run db:generate` | Sinh Prisma Client (không cần DB) |
| `npm run db:migrate` | Tạo bảng — cần `DATABASE_URL` |
| `npm run db:seed` | Nạp dữ liệu nền — cần `DATABASE_URL` |
| `npm run db:studio` | Prisma Studio |

## Tài liệu

| File | Nội dung |
|---|---|
| `CLAUDE.md` | Quy ước dự án — **đọc trước khi viết dòng code đầu tiên** |
| `docs/build-plan.md` | Kế hoạch 4 phase và tiêu chí nghiệm thu |
| `docs/versions.md` | Phiên bản thật, các quyết định, sai lệch so với build-plan |
| `docs/schema-plan.md` | Lý do đằng sau từng bảng trong schema |
| `docs/db-setup.md` | Bật Neon khi sẵn sàng |
| `docs/prototype.html` | Giao diện đã duyệt — mở ra xem khi phân vân layout |
| `docs/login-dialog.html` | Dialog đăng nhập đã duyệt |

## Kiến trúc — điều quan trọng nhất

```
prisma/schema.prisma      nguồn sự thật về cấu trúc dữ liệu
mock/                     dữ liệu tĩnh, gõ kiểu theo type của Prisma
lib/data/                 tầng truy xuất — API công khai, chữ ký cố định
  sources/mock/             HÔM NAY
  sources/db/               PHASE 4, cùng chữ ký
```

**Component không bao giờ import từ `mock/`.** Chỉ import từ `lib/data/`.
Nhờ vậy khi nối database thật, mỗi file trong `lib/data/` chỉ đổi một dòng import — không component nào phải sửa.
