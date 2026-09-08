# Deploy lên Vercel

Điều kiện: đã có Neon (`docs/db-setup.md`) và Google OAuth (`docs/google-oauth.md`) chạy ở local. Trên Vercel **bắt buộc có database** — nó chạy nhiều instance serverless, bộ nhớ tiến trình không chia sẻ được, nên đăng nhập và làm bài sẽ hỏng ngẫu nhiên nếu thiếu.

Build không cần database (`prisma generate` chỉ đọc schema), nhưng runtime cần.

---

## 1. Đưa code lên GitHub

```bash
git remote add origin git@github.com:<user>/bjt-prep.git   # nếu chưa có
git push -u origin main
```

`prisma/migrations/` phải nằm trong repo — production tạo bảng từ đó.

## 2. Tạo project trên Vercel

1. Vercel → **Add New… → Project** → import repo
2. Framework preset: **Next.js** (tự nhận). Build command để mặc định — `package.json` đã có `"build": "prisma generate && next build"`.
3. Settings → General → **Node.js Version: 22.x** (`package.json` khai `engines.node >= 22`; Node 22 có `WebSocket` sẵn cho driver Neon)
4. **Chưa bấm Deploy** — đặt biến môi trường trước.

## 3. Biến môi trường (Settings → Environment Variables, môi trường Production)

```
DATABASE_URL=            # chuỗi POOLED của Neon (host có -pooler)
DATABASE_URL_UNPOOLED=   # chuỗi trực tiếp (không -pooler) — cho migrate
BETTER_AUTH_SECRET=      # sinh MỚI: openssl rand -base64 32 — KHÔNG dùng lại secret local
BETTER_AUTH_URL=https://<tên-miền>.vercel.app
NEXT_PUBLIC_APP_URL=https://<tên-miền>.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=<email của bạn>   # bootstrap admin đầu tiên
```

Tên miền: Vercel gán `<project>.vercel.app` ngay khi tạo project; lấy nó điền vào hai biến URL.

## 4. Google Cloud Console

OAuth client đang dùng → thêm:

```
Authorized JavaScript origins:  https://<tên-miền>.vercel.app
Authorized redirect URIs:       https://<tên-miền>.vercel.app/api/auth/callback/google
```

OAuth consent screen → **Publish app**. Ở chế độ Testing chỉ email trong Test users đăng nhập được; scope `email` và `profile` không cần Google xét duyệt.

**Preview deployment** có URL ngẫu nhiên nên OAuth sẽ báo `redirect_uri_mismatch` ở preview. Đăng nhập chỉ hoạt động trên domain production. Chấp nhận, không sửa.

## 5. Tạo bảng và nạp dữ liệu vào DB production

Từ máy local, trỏ vào database production **một lần**:

```bash
DATABASE_URL_UNPOOLED="<chuỗi unpooled>" npm run db:migrate:deploy
DATABASE_URL="<chuỗi pooled>" npm run db:seed
DATABASE_URL="<chuỗi pooled>" npm run db:seed:content
```

Dùng `migrate deploy` chứ không phải `migrate dev` — `dev` có thể xoá dữ liệu.

Nếu local đã trỏ sẵn vào cùng Neon project (chỉ có một DB) thì ba lệnh trên đã chạy ở bước setup, bỏ qua.

## 6. Deploy và kiểm

Bấm **Deploy** (hoặc push lên `main`). Sau khi xong:

- Mở trang chủ: render được, chuyển sáng/tối không nhấp nháy
- Đăng nhập Google bằng email trong `ADMIN_EMAILS` → header hiện mục "Quản trị"
- `/practice` → làm một bộ → nộp → `/result` hiện giải thích
- Mở `/mock-test` → MT-03: ba phần, ba đồng hồ, "Kết thúc phần 1" khoá phần 1
- Mở tab ẩn danh, dán URL `/result/<id>` vừa xem → chuyển sang đăng nhập
- Neon console → bảng `attempt` có dòng mới

Nếu log Vercel báo `WebSocket is not defined`: Node runtime cũ hơn 22. Kiểm lại mục 2, hoặc thêm vào `lib/db.ts`:

```ts
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
if (typeof WebSocket === 'undefined') neonConfig.webSocketConstructor = ws;
```

## Sau này

- **Domain riêng**: Vercel → Domains → thêm; rồi đổi `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` và redirect URI trên Google.
- **Migration mới**: local `npm run db:migrate` → commit `prisma/migrations/` → push → trước khi deploy chạy `db:migrate:deploy` trỏ vào production. Thứ tự này tránh code mới chạy trên schema cũ.
