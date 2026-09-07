# Bật database thật (Neon)

Hạ tầng đã dựng sẵn từ Phase 0. Khi bạn có Neon, các bước dưới đây chạy được ngay — **không cần chờ Phase 1–3 xong**.

Giai đoạn giao diện không cần database. Làm phần này khi bạn muốn nhập nội dung đề thật bằng Prisma Studio thay vì sửa file mock.

---

## 1. Tạo Neon project

1. Vào https://console.neon.tech → **New Project**
2. Đặt tên `bjt-prep`, region gần nhất là **Singapore (ap-southeast-1)**
3. Postgres version: mặc định (17+)
4. Sau khi tạo, mở tab **Connection Details** → chọn **Prisma** ở dropdown → copy chuỗi

Chuỗi có dạng:

```
postgresql://<user>:<password>@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Dùng bản **`-pooler`**. Driver adapter Neon trong `lib/db.ts` được viết cho pooled connection.

## 2. Đặt biến môi trường

```bash
cp .env.example .env
```

Mở `.env`, bỏ comment và dán chuỗi vừa copy:

```
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
```

`.env` đã nằm trong `.gitignore`, không bao giờ commit.

## 3. Tạo bảng

```bash
npm run db:migrate
```

Prisma sẽ hỏi tên migration — đặt `init`. Lệnh này đọc `prisma.config.ts` để lấy `DATABASE_URL` và ghi migration vào `prisma/migrations/`.

## 4. Nạp dữ liệu nền

```bash
npm run db:seed
```

Nạp 3 phần · 9 section · 6 bậc điểm · 23 nhãn kỹ năng · 6 chủ đề từ vựng. Đây là dữ liệu cấu trúc, gần như không đổi. Seed dùng `upsert` nên chạy lại nhiều lần vô hại.

Prisma 7 **bỏ tự động seed** sau migrate — phải gọi tay lệnh trên.

## 5. Kiểm tra

```bash
npm run db:studio
```

Mở http://localhost:5555. Bảng `SectionDef` phải có đúng 9 dòng, `Tag` 23 dòng, `ScoringBand` 6 dòng.

## 6. Chuyển tầng dữ liệu sang DB

Đây là bước cuối, và là lý do `lib/data/` được cấu trúc như hiện tại:

```
lib/data/questions.ts     ← API công khai, chữ ký KHÔNG đổi
  └─ re-export từ lib/data/sources/mock/questions.ts     ← hôm nay
  └─ re-export từ lib/data/sources/db/questions.ts       ← sau khi có DB
```

Với mỗi file trong `lib/data/`, đổi **đúng một dòng import**. Không component nào phải sửa.

Tìm việc còn lại:

```bash
grep -rn "TODO(db)\|TODO(r2)" --include="*.ts" --include="*.tsx" .
```

---

## Lưu ý vận hành

**Prisma 7 bắt buộc driver adapter.** `lib/db.ts` đã cấu hình sẵn `PrismaNeon`. Không tạo `new PrismaClient()` trần ở bất cứ đâu — sẽ lỗi runtime.

**Chỉ server chạm database.** Client không bao giờ query trực tiếp bảng câu hỏi — mọi thứ đi qua Route Handler. Xem mục "Quy tắc bảo mật" trong `CLAUDE.md`.

**Neon branching.** Trước khi chạy migration rủi ro, tạo branch trong Neon console và trỏ `DATABASE_URL` vào đó. Rẻ hơn khôi phục từ backup nhiều.

**Đừng nâng Prisma theo banner của CLI.** Đọc `docs/versions.md` mục "Bẫy Prisma" trước.
