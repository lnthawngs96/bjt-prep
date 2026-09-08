# Deploy lên Vercel

## Trả lời ngắn cho câu "có cần add Postgres không?"

**Build không cần database.** Nhưng nếu không có, trên Vercel sẽ **đăng nhập không được
và làm bài không được** — xem mục "Vì sao" bên dưới. Xem trang thì vẫn xem được.

Nếu chọn thêm database: **chọn Neon, không chọn Prisma Postgres.**
`docs/schema-plan.md` đã chốt Neon, và `lib/db.ts` viết sẵn cho `@prisma/adapter-neon`.
Chọn Prisma Postgres thì phải đổi adapter và sửa lại cách kết nối.

---

## Vì sao thiếu database thì đăng nhập hỏng trên Vercel

Giai đoạn này Better Auth dùng `memoryAdapter`, và lượt làm bài lưu trong
`lib/data/sources/mock/store.ts` — cả hai đều nằm trong bộ nhớ tiến trình Node.

Ở localhost chỉ có **một** tiến trình nên chạy tốt. Vercel chạy **nhiều instance
serverless**, mỗi request có thể rơi vào instance khác nhau:

| Việc | Chuyện xảy ra |
|---|---|
| Đăng nhập Google | Bản ghi `verification` lưu ở instance A, Google gọi callback về instance B → không thấy state → **đăng nhập thất bại** |
| Bấm làm bài | `POST /api/attempts` tạo lượt ở instance A, mở `/exam/<id>` rơi vào instance B → **404** |
| Nộp bài | Tương tự, không tìm thấy lượt |

Nên chỉ có hai lựa chọn thành thật:

**A. Deploy để XEM giao diện.** Không thêm database. Trang chủ, luyện thi, từ vựng,
ngữ pháp, thi thử, xếp hạng đều render bằng dữ liệu mẫu. Đăng nhập và làm bài không
dùng được. Đủ để bạn xem thiết kế trên máy thật và gửi link cho người khác xem.

**B. Deploy để DÙNG được.** Thêm Neon, rồi chuyển Better Auth sang `prismaAdapter`
và đưa lượt làm bài xuống bảng `Attempt`/`AttemptAnswer`. Nội dung đề vẫn lấy từ
`mock/` cũng được — dù sao hiện mới có 14 câu.

---

## Các bước chung (cả A và B)

1. Vercel → **Add New… → Project** → import `lnthawngs96/bjt-prep`
2. Framework preset: **Next.js** (tự nhận)
3. Build command để **mặc định** — `package.json` đã có
   `"build": "prisma generate && next build"`.
   Bước `prisma generate` là bắt buộc: client sinh vào `app/generated/` và thư mục
   đó nằm trong `.gitignore`, không có bước này thì build hỏng với
   `Module not found: Can't resolve '@/app/generated/prisma/enums'`.
4. Đặt biến môi trường (Settings → Environment Variables):

   ```
   BETTER_AUTH_SECRET=<sinh MỚI: openssl rand -base64 32>
   BETTER_AUTH_URL=https://<tên-miền>.vercel.app
   NEXT_PUBLIC_APP_URL=https://<tên-miền>.vercel.app
   ADMIN_EMAILS=lengocthang3111996@gmail.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

   **Đừng dùng lại `BETTER_AUTH_SECRET` của máy local.** Sinh một cái riêng cho production.

5. Google Cloud Console → OAuth client → thêm vào cùng client đang dùng:

   ```
   Authorized JavaScript origins:  https://<tên-miền>.vercel.app
   Authorized redirect URIs:       https://<tên-miền>.vercel.app/api/auth/callback/google
   ```

   Lưu ý: **preview deployment có URL ngẫu nhiên** (`bjt-prep-abc123.vercel.app`) nên
   OAuth sẽ báo `redirect_uri_mismatch` ở preview. Đăng nhập chỉ hoạt động trên domain
   production cố định. Nếu cần đăng nhập ở preview thì thêm từng URL vào Google, hoặc
   gắn một domain cố định cho nhánh đó.

---

## Thêm cho phương án B

6. Vercel → **Storage** → **Neon** → tạo database, gắn vào project.
   Integration tự thêm `DATABASE_URL` và vài biến `PG*` khác. Dùng chuỗi **pooled**
   (có `-pooler` trong host) — `lib/db.ts` viết cho pooled connection.

7. Chạy migration. Từ máy local, trỏ vào database production **một lần**:

   ```bash
   DATABASE_URL="<chuỗi pooled từ Neon>" npx prisma migrate deploy
   DATABASE_URL="<chuỗi pooled từ Neon>" npm run db:seed
   ```

   Dùng `migrate deploy` chứ không phải `migrate dev` — `dev` có thể xoá dữ liệu.

8. Phần code còn lại (đổi `memoryAdapter` → `prismaAdapter`, đưa lượt làm bài xuống
   bảng) chưa làm. Xem `docs/db-setup.md`.

---

## Sau khi deploy, kiểm nhanh

- Mở trang chủ: thước điểm, việc hôm nay, biểu đồ tuần hiện đủ
- Chuyển sáng/tối, tải lại trang — không nhấp nháy
- Mở trên điện thoại: dưới 860px header thu thành hamburger
- `/practice` bấm một bộ: chưa đăng nhập thì dialog mở tại chỗ, không nhảy trang
