# Bật database thật (Neon)

Code đã sẵn sàng: tầng dữ liệu tự chuyển sang Prisma khi có `DATABASE_URL`, Better Auth chuyển sang `prismaAdapter`. Bạn chỉ cần tạo Neon và chạy ba lệnh.

Không có `DATABASE_URL` thì app chạy trên `mock/` (đăng nhập không bền, không lưu bài làm) — đủ để dev giao diện và chạy test.

---

## 1. Tạo Neon project

1. Vào https://console.neon.tech → **New Project**
2. Đặt tên `bjt-prep`, region gần nhất là **Singapore (ap-southeast-1)**
3. Postgres version: mặc định
4. Sau khi tạo, mở **Connection Details**. Lấy **hai** chuỗi:
   - bật **Pooled connection** → chuỗi có `-pooler` trong host → `DATABASE_URL`
   - tắt Pooled connection → chuỗi không có `-pooler` → `DATABASE_URL_UNPOOLED`

```
postgresql://<user>:<password>@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
postgresql://<user>:<password>@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Runtime (`lib/db.ts`) dùng chuỗi pooled. `prisma migrate` dùng chuỗi unpooled — qua PgBouncer nó có thể treo vì không giữ được advisory lock.

## 2. Đặt biến môi trường

```bash
cp .env.example .env   # nếu chưa có
```

Mở `.env`, bỏ comment và dán hai chuỗi:

```
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://...neon.tech/neondb?sslmode=require"
```

`.env` đã nằm trong `.gitignore`, không bao giờ commit.

## 3. Tạo bảng

```bash
npm run db:migrate
```

Prisma hỏi tên migration — đặt `init`. Lệnh này đọc `prisma.config.ts`, ghi migration vào `prisma/migrations/`. **Commit thư mục `prisma/migrations/`** — production dùng nó với `prisma migrate deploy`.

## 4. Nạp dữ liệu

```bash
npm run db:seed            # cấu trúc: 3 phần · 9 section · 6 bậc · 23 nhãn · 6 chủ đề
npm run db:seed:content    # nội dung mẫu từ mock/: 11 nhóm · 27 câu · từ vựng · ngữ pháp · bộ · đề
```

Cả hai đều upsert, chạy lại nhiều lần vô hại. Prisma 7 **bỏ tự động seed** sau migrate — phải gọi tay.

## 5. Kiểm tra

```bash
npm run db:studio
```

Mở http://localhost:5555. `SectionDef` 9 dòng, `Tag` 23 dòng, `QuestionGroup` 11 dòng, `Question` 27 dòng.

Rồi `npm run dev`, đăng nhập Google, làm một bộ luyện tập. Bảng `Attempt` và `AttemptAnswer` phải có dòng mới. Restart dev server, phiên đăng nhập vẫn còn.

---

## Cách tầng dữ liệu chọn nguồn

```
lib/data/attempts.ts          ← API công khai, chữ ký KHÔNG đổi
  const src: typeof mock = USE_DB ? dbSource : mock
  ├─ sources/mock/attempts.ts   ← không có DATABASE_URL (dev, test)
  └─ sources/db/attempts.ts     ← có DATABASE_URL (production)
```

`USE_DB` nằm trong `lib/data/source.ts`. Ép `typeof mock` lên nguồn db nên hai nguồn không thể lệch chữ ký — lệch là typecheck gãy. `lib/db.ts` khởi tạo Prisma lười, chỉ khi có truy vấn đầu tiên, nên import không có DB vẫn an toàn.

`mock/` giờ là **fixture nội dung**: `prisma/seed-content.ts` đọc nó để nạp vào DB, và `tests/` dùng nó qua `sources/mock`.

---

## Lưu ý vận hành

**Prisma 7 bắt buộc driver adapter.** `lib/db.ts` đã cấu hình `PrismaNeon`. Không tạo `new PrismaClient()` trần ở bất cứ đâu — sẽ lỗi runtime.

**Chỉ server chạm database.** Client không bao giờ query trực tiếp — mọi thứ đi qua Route Handler hoặc server component. Xem mục "Quy tắc bảo mật" trong `CLAUDE.md`.

**Neon branching.** Trước khi chạy migration rủi ro, tạo branch trong Neon console và trỏ `DATABASE_URL` vào đó. Rẻ hơn khôi phục từ backup nhiều.

**Đừng nâng Prisma theo banner của CLI.** Đọc `docs/versions.md` mục "Bẫy Prisma" trước.

**Nâng Better Auth** thì chạy lại `DATABASE_URL=postgres://x npx @better-auth/cli generate --config lib/auth.ts --output /tmp/ba.prisma` và đối chiếu bốn model auth trong schema. Lần đối chiếu 08/09/2026 với 1.7.3: khớp, chỉ khác `role`/`banned` ta cố ý giữ enum và non-null.
