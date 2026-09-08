# Bật đăng nhập Google

Khoảng 5 phút. Cần một tài khoản Google bất kỳ.

---

## 1. Tạo OAuth client

1. Vào https://console.cloud.google.com/apis/credentials
2. Chọn hoặc tạo một project (tên gì cũng được, ví dụ `bjt-prep`)
3. Nếu được hỏi **OAuth consent screen** trước, làm bước 2 dưới đây rồi quay lại
4. **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `BJT Prep — local`
7. **Authorized JavaScript origins** — thêm:
   ```
   http://localhost:3000
   ```
8. **Authorized redirect URIs** — thêm **chính xác** dòng này:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   Sai một ký tự là Google trả lỗi `redirect_uri_mismatch`. Chú ý `/api/auth/callback/google`,
   không phải `/api/auth/[...all]` hay `/api/auth/callback`.
9. **Create** → copy **Client ID** và **Client secret**

## 2. OAuth consent screen

- User type: **External**
- App name: `BJT Prep`
- User support email và Developer contact: email của bạn
- Scopes: để mặc định, chỉ cần `email` và `profile`
- **Test users**: thêm chính email bạn sẽ dùng để đăng nhập

Ở chế độ Testing, chỉ những email trong danh sách Test users mới đăng nhập được.
Đó là điều bình thường khi đang phát triển — không cần submit để Google duyệt.

## 3. Dán vào `.env`

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

Đồng thời kiểm `ADMIN_EMAILS` đã có email của bạn — đó là thứ quyết định bạn
có thấy mục **Quản trị** trên header hay không.

**Khởi động lại dev server** sau khi sửa `.env`. Next.js chỉ đọc biến môi trường lúc khởi động.

## 4. Kiểm tra

```bash
npm run dev
```

- Vào http://localhost:3000/practice, bấm một bộ luyện tập khi chưa đăng nhập
  → dialog phải mở **tại chỗ**, không nhảy sang trang khác
- Đăng nhập Google xong phải quay lại đúng `/practice`
- Header đổi từ nút "Đăng nhập" sang avatar có chữ cái đầu tên bạn
- Email trong `ADMIN_EMAILS` thì thấy mục "Quản trị"; tài khoản khác không thấy

Nếu dialog hiện ô cảnh báo vàng "Chưa cấu hình Google OAuth" thì server chưa đọc
được biến — kiểm lại `.env` và nhớ khởi động lại.

---

## Khi lên production

Thêm origin và redirect URI của tên miền thật vào cùng OAuth client:

```
https://<tên-miền>
https://<tên-miền>/api/auth/callback/google
```

Và đặt lại các biến trên Vercel:

```
BETTER_AUTH_URL=https://<tên-miền>
NEXT_PUBLIC_APP_URL=https://<tên-miền>
BETTER_AUTH_SECRET=   # sinh MỚI cho production: openssl rand -base64 32
```

Đừng dùng lại secret của máy local.

---

## Lưu ý về giai đoạn hiện tại

Chưa có database, nên Better Auth đang dùng `memoryAdapter`: tài khoản và phiên
đăng nhập nằm trong tiến trình Node và **mất khi restart dev server**. Đăng nhập
lại là xong. Phase 4 nối `prismaAdapter` thì dữ liệu mới bền.

Trước khi migrate PHẢI chạy:

```bash
npx @better-auth/cli generate
```

rồi đối chiếu với bốn model `User` / `Session` / `Account` / `Verification` trong
`prisma/schema.prisma`. Schema của Better Auth đổi giữa các phiên bản — đừng tin
bản trong repo là mới nhất.
