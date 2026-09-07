# Phiên bản và các quyết định kỹ thuật

Ghi ngày **07/09/2026**, khởi tạo dự án. Mọi số dưới đây lấy bằng `npm view <pkg> version`, không lấy từ trí nhớ.

Khi nâng bất kỳ dòng nào, cập nhật file này cùng lúc.

---

## Bảng phiên bản

| Package | Bản đang dùng | Ghi chú |
|---|---|---|
| next | 16.3.4 | App Router, Turbopack |
| react · react-dom | 19.2.8 | |
| typescript | ^5 | strict |
| tailwindcss | ^4 (4.3.3) | **CSS-first, không có file config** |
| @tailwindcss/postcss | ^4 | |
| prisma (CLI) | **7.10.0 — ghim cứng** | xem "Bẫy Prisma" |
| @prisma/client | **7.10.0 — ghim cứng** | |
| @prisma/adapter-neon | **7.10.0 — ghim cứng** | phải cùng minor với client |
| @neondatabase/serverless | ^1.1.0 | |
| ws | ^8.21.3 | Neon driver cần WebSocket ở Node |
| zustand | ^5.0.15 | state phiên làm bài |
| @tanstack/react-query | ^5.102.8 | dữ liệu server |
| react-icons | ^5.7.0 | **chỉ dùng `react-icons/fa6`** |
| next-themes | ^0.4.6 | |
| clsx | ^2.1.1 | ngoại lệ được duyệt trong CLAUDE.md |
| tailwind-merge | ^3.6.0 | ngoại lệ được duyệt trong CLAUDE.md |
| tsx | ^4.23.13 | dev, chạy seed |
| dotenv | ^17 | dev, cho prisma.config.ts và seed |
| better-auth | **chưa cài** — Phase 2, ghim `1.7.3` | |
| ts-fsrs | **chưa cài** — phase SRS, `5.4.2` | |

### Quyết định: `cn()` dùng `clsx` + `tailwind-merge`

`CLAUDE.md` cho hai lựa chọn. Chọn thư viện thay vì tự viết template literal, vì Phase 3 có nhiều primitive nhận `className` từ ngoài để ghi đè; không có `tailwind-merge` thì thứ tự class quyết định kết quả và rất dễ sai âm thầm. Hai package cộng lại dưới 4 KB gzip, không phải thư viện UI.

---

## ⚠️ Bẫy Prisma — lý do phải ghim cứng

Lúc khởi tạo:

```
prisma@latest          → 8.0.0-rc.13   ← release candidate, publish thẳng lên tag latest
@prisma/client@latest  → 7.10.0        ← stable
```

Làm đúng theo chữ "luôn cài `@latest`" sẽ cho ra **CLI v8-RC ghép với client v7** — lệch cặp, generate hỏng. Chính CLI sau khi cài vẫn hiện banner mời nâng lên `8.0.0-rc.13`. **Đừng nhận lời mời đó.**

Quy tắc rút ra, đã bổ sung vào `CLAUDE.md`: `@latest` là mặc định, **`npm view <pkg> dist-tags` là bước xác minh bắt buộc**.

Nâng lên Prisma 8 khi và chỉ khi cả `prisma` lẫn `@prisma/client` đều có bản `8.x` ổn định trên tag `latest`.

### Cảnh báo `npm audit` — đã xem xét, chấp nhận

`npm audit` báo 4 lỗ hổng mức high, tất cả đến từ `mysql2` là dependency bắc cầu của `@prisma/config` bên trong **Prisma CLI**. Ba lý do bỏ qua:

1. `prisma` là `devDependency`, CLI không bao giờ vào bundle production
2. Dự án dùng PostgreSQL, `mysql2` không bao giờ được nạp
3. `npm audit fix --force` sẽ hạ xuống `prisma@6.19.3` — đúng thứ ta cố tình tránh

Kiểm lại khi nâng Prisma.

---

## Hai sai lệch so với `docs/build-plan.md` bản gốc

Build-plan viết trước khi biết phiên bản thật. Hai chỗ dưới đây **build-plan sai, file này đúng**.

### 1. Không có `tailwind.config.ts` (build-plan §1.2)

Build-plan bảo tạo `tailwind.config.ts` và map biến thành token. Tailwind v4 là **CSS-first** — `create-next-app` không sinh file config nữa, và file đó cũng không được đọc.

→ Toàn bộ token khai báo bằng `@theme inline` trong `app/globals.css`.

Kéo theo một thay đổi cú pháp **hỏng im lặng nếu viết sai**:

```
v3:  bg-[--ov]     ← ở v4 bị hiểu là tên màu, không ra gì, KHÔNG báo lỗi
v4:  bg-(--ov)     ← đúng
```

`CLAUDE.md` dòng snippet Modal đã sửa theo v4.

### 2. `prisma-client-js` và `previewFeatures` không còn (build-plan §1.1)

Prisma 7 bỏ generator `prisma-client-js`, và `driverAdapters` đã GA nên không còn là preview feature. Ngoài ra `url` không được phép nằm trong `datasource` của schema nữa.

Đã sửa trong `prisma/schema.prisma` — **chỉ khối `generator` và `datasource`, không đụng một model nào**:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"   // output nay là BẮT BUỘC
}

datasource db {
  provider = "postgresql"
  // url chuyển sang prisma.config.ts + driver adapter trong lib/db.ts
}
```

Kéo theo ba việc:

- Client sinh vào `app/generated/prisma`, đã cho vào `.gitignore`
- Mọi type đi qua **`lib/prisma-types.ts`** — chỗ duy nhất chạm đường dẫn generated
- Prisma 7 bỏ key `prisma` trong `package.json` → có `prisma.config.ts` ở gốc repo, và **seed không còn tự chạy**, phải gọi `npm run db:seed`

`prisma generate` vẫn chạy được **không cần database** — đã kiểm.

---

## Sai lệch nghiệp vụ đã sửa so với starter

Đối chiếu sample問題 chính thức trên kanken.or.jp/bjt.

**`prisma/seed.ts` — L2 và L3 thiếu tài liệu hình ảnh.** Sample 第1部 cho thấy 発言聴解問題 hiển thị **ảnh chụp** và 総合聴解問題 hiển thị **tranh minh hoạ**, nhưng seed đặt `hasMaterial: false` cho cả hai. Đã đổi thành `true` và sửa `descriptionVi` cho khớp. Không đụng schema — `MaterialKind.IMAGE` đã có sẵn.

**Điều hướng màn làm bài.** BJT thật là CBT tuyến tính: audio phát một lần, phần 聴解/聴読解 không lùi được. Đã thêm mục "Điều hướng màn làm bài" vào `CLAUDE.md`. Suy ra từ `AttemptMode`, không cần cột mới trong schema.

Phần còn lại của schema và cấu trúc đề **đã đúng, không sửa gì**: 3 phần · 80 câu · 45/30/30 phút · thang 0–800 · 6 bậc J5→J1+ · 四肢択一 · cả 9 tên section khớp từng chữ với trang chính thức.
