# Bật database, đăng nhập Google và deploy

Ba việc cài đặt còn lại của dự án, làm theo thứ tự. Chưa làm gì trong này thì app
vẫn chạy được trên `mock/` — đủ để dựng giao diện và chạy test, nhưng đăng nhập
không bền qua restart và bài làm không được lưu.

---

# 1. Neon — database thật

Code đã sẵn sàng: tầng dữ liệu tự chuyển sang Prisma khi có `DATABASE_URL`,
Better Auth chuyển sang `prismaAdapter`. Chỉ cần tạo Neon và chạy ba lệnh.

## 1.1 Tạo project

1. https://console.neon.tech → **New Project**, tên `bjt-prep`
2. Region gần nhất: **Singapore (ap-southeast-1)**
3. Mở **Connection Details**, lấy **hai** chuỗi:
   - bật **Pooled connection** (host có `-pooler`) → `DATABASE_URL`
   - tắt Pooled connection (không có `-pooler`) → `DATABASE_URL_UNPOOLED`

Runtime (`lib/db.ts`) dùng chuỗi pooled. `prisma migrate` dùng chuỗi unpooled —
qua PgBouncer nó có thể treo vì không giữ được advisory lock.

## 1.2 Đặt biến

```bash
cp .env.example .env   # nếu chưa có
```

```
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://...neon.tech/neondb?sslmode=require"
```

`.env` đã nằm trong `.gitignore`.

## 1.3 Tạo bảng và nạp dữ liệu

```bash
npm run db:migrate         # đặt tên migration là `init`
npm run db:seed            # cấu trúc: 3 phần · 9 section · 6 bậc · 23 nhãn · 6 chủ đề
npm run db:seed:content    # nội dung mẫu từ mock/: 11 nhóm · 27 câu · từ vựng · ngữ pháp
```

**Commit thư mục `prisma/migrations/`** — production tạo bảng từ đó.
Cả hai lệnh seed đều upsert, chạy lại vô hại. Prisma 7 **bỏ tự động seed** sau
migrate nên phải gọi tay.

## 1.4 Kiểm

```bash
npm run db:studio     # http://localhost:5555
```

`SectionDef` 9 dòng · `Tag` 23 dòng · `QuestionGroup` 11 dòng · `Question` 27 dòng.
Rồi `npm run dev`, đăng nhập, làm một bộ luyện tập: bảng `Attempt` và
`AttemptAnswer` phải có dòng mới, và restart dev server thì phiên vẫn còn.

## 1.5 Tầng dữ liệu chọn nguồn thế nào

```
lib/data/attempts.ts          ← API công khai, chữ ký KHÔNG đổi
  const src: typeof mock = USE_DB ? dbSource : mock
  ├─ sources/mock/attempts.ts   ← không có DATABASE_URL (dev, test)
  └─ sources/db/attempts.ts     ← có DATABASE_URL (production)
```

`USE_DB` nằm trong `lib/data/source.ts`. Ép `typeof mock` lên nguồn db nên hai
nguồn không thể lệch chữ ký — lệch là typecheck gãy. `lib/db.ts` khởi tạo Prisma
lười nên import khi không có DB vẫn an toàn.

`mock/` giờ là **fixture nội dung**: `prisma/seed-content.ts` đọc nó để nạp vào
DB, và `tests/` dùng nó qua `sources/mock`.

## 1.6 Lưu ý vận hành

- **Prisma 7 bắt buộc driver adapter.** `lib/db.ts` đã cấu hình `PrismaNeon`.
  Không tạo `new PrismaClient()` trần ở bất cứ đâu — lỗi runtime.
- **Chỉ server chạm database.** Client đi qua Route Handler hoặc server component.
- **Neon branching.** Trước migration rủi ro, tạo branch trong Neon console và trỏ
  `DATABASE_URL` vào đó. Rẻ hơn khôi phục từ backup nhiều.
- **Đừng nâng Prisma theo banner của CLI.** Đọc `docs/versions.md` mục "Bẫy Prisma".
- **Nâng Better Auth** thì chạy lại
  `DATABASE_URL=postgres://x npx @better-auth/cli generate --config lib/auth.ts --output /tmp/ba.prisma`
  và đối chiếu bốn model auth trong schema. Lần đối chiếu 08/09/2026 với 1.7.3:
  khớp, chỉ khác `role`/`banned` ta cố ý giữ enum và non-null.

---

# 2. Đăng nhập Google

Khoảng 5 phút, cần một tài khoản Google bất kỳ.

## 2.1 Tạo OAuth client

1. https://console.cloud.google.com/apis/credentials → chọn hoặc tạo project
2. **Create Credentials** → **OAuth client ID** → Application type **Web application**
3. **Authorized JavaScript origins**: `http://localhost:3000`
4. **Authorized redirect URIs** — **chính xác** dòng này:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   Sai một ký tự là Google trả `redirect_uri_mismatch`. Chú ý
   `/api/auth/callback/google`, không phải `/api/auth/[...all]`.
5. **Create** → copy Client ID và Client secret

## 2.2 OAuth consent screen

User type **External** · App name `BJT Prep` · scopes để mặc định (`email`,
`profile`) · **Test users**: thêm chính email bạn sẽ dùng.

Ở chế độ Testing chỉ email trong Test users đăng nhập được. Đó là bình thường
khi đang phát triển, không cần submit để Google duyệt.

## 2.3 Dán vào `.env`

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
ADMIN_EMAILS=<email của bạn>
```

**Khởi động lại dev server** — Next.js chỉ đọc biến môi trường lúc khởi động.

## 2.4 Kiểm

- `/practice` khi chưa đăng nhập → bấm một bộ → dialog phải mở **tại chỗ**
- Đăng nhập xong quay lại đúng `/practice`
- Header đổi từ nút "Đăng nhập" sang avatar
- Email trong `ADMIN_EMAILS` thì thấy mục "Quản trị"

Dialog còn hiện ô cảnh báo vàng "Chưa cấu hình Google OAuth" nghĩa là server chưa
đọc được biến — kiểm lại `.env` và nhớ khởi động lại.

## 2.5 Vai trò admin

`ADMIN_EMAILS` chỉ **bootstrap admin đầu tiên**: email trong danh sách được gán
`role = ADMIN` đúng lúc tài khoản được tạo. Tài khoản đã tồn tại không bị đổi.
Sau đó đổi vai trò ở `/admin/users`, và có thể bỏ biến đó đi.

---

# 3. Deploy Vercel

Điều kiện: mục 1 và 2 đã chạy được ở local. Trên Vercel **bắt buộc có database** —
nhiều instance serverless không chia sẻ bộ nhớ tiến trình, thiếu DB thì đăng nhập
và làm bài hỏng ngẫu nhiên. Build không cần DB (`prisma generate` chỉ đọc schema),
runtime thì cần.

## 3.1 Tạo project

1. Push code lên GitHub — `prisma/migrations/` phải nằm trong repo
2. Vercel → **Add New… → Project** → import repo, preset **Next.js**
3. Settings → General → **Node.js Version: 22.x** (Node 22 có `WebSocket` sẵn cho
   driver Neon)
4. **Chưa bấm Deploy** — đặt biến trước

## 3.2 Biến môi trường (Production)

```
DATABASE_URL=            # chuỗi POOLED (host có -pooler)
DATABASE_URL_UNPOOLED=   # chuỗi trực tiếp — cho migrate
BETTER_AUTH_SECRET=      # sinh MỚI: openssl rand -base64 32. KHÔNG dùng lại secret local
BETTER_AUTH_URL=https://<tên-miền>.vercel.app
NEXT_PUBLIC_APP_URL=https://<tên-miền>.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=<email của bạn>
```

## 3.3 Google Cloud Console

Thêm vào **cùng OAuth client**:

```
Authorized JavaScript origins:  https://<tên-miền>.vercel.app
Authorized redirect URIs:       https://<tên-miền>.vercel.app/api/auth/callback/google
```

Rồi OAuth consent screen → **Publish app**.

**Preview deployment** có URL ngẫu nhiên nên OAuth luôn báo `redirect_uri_mismatch`
ở preview. Đăng nhập chỉ chạy trên domain production. Chấp nhận, đừng sửa.

## 3.4 Tạo bảng trên DB production

Từ máy local, trỏ vào database production **một lần**:

```bash
DATABASE_URL_UNPOOLED="<chuỗi unpooled>" npm run db:migrate:deploy
DATABASE_URL="<chuỗi pooled>" npm run db:seed
DATABASE_URL="<chuỗi pooled>" npm run db:seed:content
```

`migrate deploy` chứ không phải `migrate dev` — `dev` có thể xoá dữ liệu.
Nếu local vốn đã trỏ vào cùng Neon project thì ba lệnh này đã chạy ở mục 1, bỏ qua.

## 3.5 Kiểm sau khi deploy

- Trang chủ render được, chuyển sáng/tối không nhấp nháy
- Đăng nhập bằng email trong `ADMIN_EMAILS` → header hiện mục "Quản trị"
- `/practice` → làm một bộ → nộp → `/result` hiện giải thích
- `/mock-test` → MT-03: ba phần, ba đồng hồ, "Kết thúc phần 1" khoá phần 1
- Tab ẩn danh, dán URL `/result/<id>` vừa xem → phải chuyển sang đăng nhập
- Neon console → bảng `attempt` có dòng mới

Log Vercel báo `WebSocket is not defined` nghĩa là Node runtime cũ hơn 22 — kiểm
lại mục 3.1.

## 3.6 Sau này

- **Domain riêng**: Vercel → Domains → thêm; rồi đổi `BETTER_AUTH_URL`,
  `NEXT_PUBLIC_APP_URL` và redirect URI trên Google.
- **Migration mới**: local `npm run db:migrate` → commit `prisma/migrations/` →
  push → chạy `db:migrate:deploy` trỏ vào production **trước khi** deploy. Thứ tự
  này tránh code mới chạy trên schema cũ.
