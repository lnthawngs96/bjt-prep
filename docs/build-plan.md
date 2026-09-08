# Kế hoạch dựng — giai đoạn giao diện

Bốn phase. Làm tuần tự, **không nhảy cóc**. Mỗi phase có tiêu chí nghiệm thu; chưa đạt thì không sang phase sau.

Toàn bộ giai đoạn này **không có database, không có cloud**. Dữ liệu lấy từ `mock/`, truy xuất qua `lib/data/`. Đọc mục "Tầng dữ liệu" trong `CLAUDE.md` trước khi viết dòng code đầu tiên — đó là thứ quyết định việc nối DB thật sau này mất một buổi hay một tuần.

---

## Phase 1 — Nền tảng và giao diện học viên

### 1.1 Khởi tạo

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm i react-icons next-themes zustand @tanstack/react-query
npm i -D prisma tsx
npx prisma generate          # chỉ đọc schema, KHÔNG cần database
```

**Không cài shadcn, không cài Radix.** Toàn bộ UI viết bằng Tailwind thuần, primitive tự viết trong `components/ui/`.

Kiểm tra phiên bản thật trước khi cài, ghi lại vào `docs/versions.md`:

```bash
npm view next version && npm view react version && npm view tailwindcss version && npm view better-auth version
```

`package.json` thêm:
```json
"scripts": { "typecheck": "tsc --noEmit" }
```

### 1.2 Design system

- `app/globals.css` — toàn bộ CSS variable sáng/tối theo `CLAUDE.md`
- `tailwind.config.ts` — map biến thành token: `bg` `fg` `fg2` `fg3` `ln` `ln2` `acc` `acc-hi` `acc-soft` `acc-dim` `ok` `ng` `wr`
- Utility `.gt` cho chữ gradient, `.jp` cho tiếng Nhật
- `next/font/google`: Be Vietnam Pro + BIZ UDPGothic, có subset
- `next-themes`, `suppressHydrationWarning` trên `<html>`
### 1.2b Primitive tự viết

`components/ui/` — viết bằng Tailwind thuần, không thư viện:

| Component | Ghi chú |
|---|---|
| `Button` | variant: `gradient` · `outline` · `ghost` · `danger`. size: `sm` `md` `lg` |
| `Modal` | **thẻ `<dialog>` gốc + `showModal()`** — focus trap, Esc, backdrop, trả focus đều miễn phí |
| `Drawer` | cũng là `<dialog>`, chỉ khác animation trượt từ phải |
| `Tabs` | `role="tablist"`, `aria-selected`, phím mũi tên trái/phải |
| `Chip` | nút lọc, trạng thái `aria-pressed` |
| `Field` | label + input/textarea + thông báo lỗi |
| `Select` | `<select>` gốc, `appearance-none` + icon `FaChevronDown` |
| `Tooltip` | CSS thuần, `aria-describedby` |
| `Toast` | context nhỏ + div cố định, `role="status"` |
| `Badge` | nhãn trạng thái, biến thể màu ok/ng/wr/neutral |

Viết `lib/utils.ts` với hàm `cn()`. Dùng `clsx` + `tailwind-merge` (hai hàm nhỏ, không phải thư viện UI) hoặc tự viết bằng template literal — chọn một, ghi lại vào `docs/versions.md`.

### 1.3 Tầng dữ liệu tĩnh

```
mock/
  sections.ts     3 phần, 9 section — copy từ prisma/seed.ts
  tags.ts         23 nhãn kỹ năng
  materials.ts    1 audio + 1 bảng số liệu + 1 văn bản
  groups.ts       3 group mẫu, một group có 3 câu dùng chung tài liệu
  questions.ts    ~15 câu, có đủ explanationVi / businessNoteVi / distractorNote
  vocab.ts        ~30 từ thuộc 2 chủ đề
  grammar.ts      ~10 mẫu ngữ pháp
  sets.ts         5 bộ luyện tập
  mockTests.ts    3 đề thi thử (metadata thôi, chưa cần đủ 80 câu)
  user.ts         1 học viên mẫu kèm tiến độ, điểm yếu, thống kê tuần
lib/data/
  sections.ts  questions.ts  vocab.ts  grammar.ts
  attempts.ts  media.ts  user.ts
```

Mọi hàm `async`. Mọi chỗ cần thay đánh dấu `// TODO(db):`.

Định nghĩa hai kiểu tách bạch trong `lib/data/types.ts`:

```ts
// Gửi xuống client TRONG lúc làm bài — không có đáp án
export type QuestionForExam = Omit<Question, 'explanationVi' | 'businessNoteVi'> & {
  options: Pick<QuestionOption, 'id' | 'order' | 'textJa'>[];
};

// Chỉ trả SAU khi nộp bài
export type QuestionWithAnswer = Question & {
  options: QuestionOption[];
};
```

Vài file mp3 mẫu vào `public/mock-audio/`. `getPlaybackUrl(mediaId): Promise<string>` trả đường dẫn tĩnh.

### 1.4 Khung và các trang học viên

- `components/student/Header.tsx` — nav ngang, ẩn khi cuộn xuống quá 90px, hamburger dưới 860px
- `app/(student)/layout.tsx`
- `components/shared/ThemeToggle.tsx`
- `components/shared/AudioPlayer.tsx` — nhận `mediaId`, vẽ sóng, hỗ trợ `startMs`/`endMs`, prop `playOnce`
- `components/shared/ScoreRuler.tsx` — thước 0–800 với 6 bậc

Các trang:

| Route | Nội dung |
|---|---|
| `/` | Khối "Tiếp tục ở đây" · thước điểm · việc hôm nay · điểm yếu · biểu đồ tuần · danh sách đề thi thử |
| `/practice` | Tab 3 phần · chip section · danh sách bộ |
| `/exam/[attemptId]` | Không header. Chia đôi: tài liệu bên trái, câu hỏi bên phải. Đồng hồ, dãy số câu, nút Thoát |
| `/result/[attemptId]` | Điểm · từng câu sai · giải thích · vì sao phương án kia sai · bối cảnh công sở · phát lại đúng đoạn audio · từ và ngữ pháp cần ôn |
| `/vocabulary` | Duyệt theo chủ đề |
| `/vocabulary/review` | Flashcard, 4 nút đánh giá |
| `/grammar` | Lọc theo level và register |
| `/grammar/[slug]` | Chi tiết, ví dụ đúng và ví dụ sai cạnh nhau |
| `/mock-test` | Danh sách đề, lịch sử làm |
| `/ranking` | Bảng xếp hạng, dùng mock |

**Nghiệm thu Phase 1**
- Mọi trang render bằng dữ liệu từ `lib/data/`, không trang nào hardcode dữ liệu trong JSX
- `grep -r "from '@/mock" components/ app/` không ra kết quả nào
- Cuộn xuống header ẩn, cuộn lên hiện lại, không giật
- Chuyển sáng/tối không nhấp nháy khi tải lại trang
- Làm hết một bộ 10 câu bằng mock, ra được màn hình kết quả có đủ giải thích
- Màn thi nhận `QuestionForExam` — TypeScript báo lỗi nếu cố đọc `explanationVi` ở đó
- `npm run typecheck` sạch
- Đối chiếu `docs/prototype.html`, sai lệch thị giác dưới mức nhận thấy được

---

## Phase 2 — Đăng nhập

### 2.1 Cài đặt

```bash
npm view better-auth version    # ghim số này lại
npm i better-auth
```

**Ghim phiên bản chính xác trong `package.json`, không dùng `^`.** API plugin của Better Auth còn thay đổi giữa các bản minor.

Giai đoạn này **chưa có database**, nên dùng bộ nhớ tạm thay adapter Prisma:

- `lib/auth.ts` — `betterAuth({ ... })` với Google social provider và plugin `admin()`
- `lib/auth-client.ts` — `createAuthClient()` cho phía client
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)`
- Vai trò giai đoạn tĩnh đọc từ biến môi trường:
  ```
  ADMIN_EMAILS=you@example.com
  ```
  `// TODO(db):` ở chỗ này — sau này `role` lấy từ bảng `user` qua plugin `admin()`
- `proxy.ts` (Next 16 đổi tên từ `middleware.ts`) chặn `/admin/*` khi chưa đăng nhập
- Helper `requireAdmin()` dùng trong mọi Route Handler admin. **Proxy một mình không đủ.**

Bốn model `User` / `Session` / `Account` / `Verification` trong `prisma/schema.prisma` đã viết sẵn theo chuẩn Better Auth. Ở Phase 4, trước khi migrate phải chạy:

```bash
npx @better-auth/cli generate
```

và đối chiếu — schema của Better Auth có thể đổi theo phiên bản. **Đừng tin bản trong repo là mới nhất.**

### 2.2 Dialog đăng nhập

Bản thiết kế đã duyệt: **`docs/login-dialog.html`**. Dựng lại đúng như vậy bằng `<Modal>` tự viết.

- `components/shared/LoginDialog.tsx`
- Mở bằng Zustand store `useAuthDialog()` — bất kỳ chỗ nào trong app cũng gọi được
- Bấm vào tính năng cần đăng nhập thì mở dialog **tại chỗ**, không điều hướng sang trang khác
- `app/(auth)/login/page.tsx` chỉ là trang dự phòng cho deep link và redirect từ Google, dùng lại đúng component đó
- Nút Google gọi `authClient.signIn.social({ provider: 'google', callbackURL })`
- Nút có trạng thái đang tải: spinner thay icon, ẩn nhãn — xem file thiết kế
- Header đổi từ nút "Đăng nhập" sang avatar + dropdown (Hồ sơ · Cài đặt · Đăng xuất)

### 2.3 Nghiệm thu

- Đăng nhập Google chạy được ở local
- Dialog giống `docs/login-dialog.html` ở cả sáng và tối
- Đang xem `/practice`, bấm làm bài khi chưa đăng nhập → dialog mở tại chỗ, đăng nhập xong quay lại đúng trang đó
- Email trong `ADMIN_EMAILS` thấy mục "Quản trị" trên header, tài khoản khác không thấy
- Truy cập thẳng `/admin` bằng tài khoản thường bị chặn
- Gọi thẳng một Route Handler admin bằng tài khoản thường trả 403 — chứng minh `requireAdmin()` chạy, không chỉ proxy
- **Kiểm tra accessibility của dialog**: Esc đóng được · click ra ngoài đóng được · Tab không thoát ra khỏi dialog · đóng xong focus quay về đúng nút đã mở nó · nền không cuộn được khi dialog mở

Mục cuối là lý do bắt buộc dùng `<dialog>` gốc. Nếu tự viết bằng `<div>` thì phải làm tay cả năm thứ đó và gần như chắc chắn sẽ sót.

---

## Phase 3 — Giao diện admin

Vẫn chạy trên mock. Mục tiêu là **form đầy đủ mọi trường của schema** để khi có DB thì chỉ nối vào.

- `components/admin/Sidebar.tsx` — dọc, 60px ↔ 216px, hamburger ở đầu, nhóm "Nội dung" và "Vận hành"
- `app/(admin)/admin/layout.tsx`

| Route | Nội dung |
|---|---|
| `/admin/questions` | Danh sách phẳng · thanh pipeline theo `status` · chip lọc theo phần và trạng thái · panel sửa trượt từ phải (`<Drawer>` tự viết) |
| `/admin/materials` | CRUD, form đổi theo `kind`: AUDIO có soạn transcript kèm `startMs`/`endMs` · TABLE nhập lưới · DOCUMENT soạn văn bản · CHART nhập series |
| `/admin/media` | Danh sách file, khu vực kéo thả upload (giai đoạn này chỉ preview local, chưa upload thật) |
| `/admin/vocabulary` | CRUD từ, ví dụ, quan hệ 尊敬語/謙譲語 |
| `/admin/grammar` | CRUD, có cờ `isNegative` cho ví dụ dùng sai |
| `/admin/mock-tests` | Lắp group thành đề, bộ đếm theo từng section, cảnh báo khi chưa đủ 80 câu |
| `/admin/users` | Bảng, đổi vai trò |
| `/admin/stats` | Cột tỉ lệ đúng, lọc "câu nghi vấn" |

Panel sửa câu hỏi phải có **đủ** các trường:
câu hỏi · section · level · đoạn audio (`audioStartMs`/`audioEndMs`) · 4 phương án · đánh dấu đáp án đúng · `distractorNote` từng phương án · `explanationVi` · `businessNoteVi` · nhãn kỹ năng · liên kết từ vựng · liên kết ngữ pháp · trạng thái.

Thao tác lưu gọi `lib/data/*` — giai đoạn này ghi vào state trong bộ nhớ và hiện toast, `// TODO(db):` ở chỗ sẽ gọi Prisma.

**Nghiệm thu Phase 3**
- Mọi trường trong `prisma/schema.prisma` đều có ô nhập tương ứng — **đối chiếu từng dòng schema**
- Tạo được một group LR2 hoàn chỉnh trong bộ nhớ: 1 audio + 1 bảng + 3 câu dùng chung tài liệu, mỗi câu có đoạn audio riêng
- Đề thiếu câu thì nút publish bị khoá, thông báo rõ thiếu section nào
- Sidebar thu gọn còn icon, hover ra tooltip
- Không có card bo góc nào trong nội dung chính
- Drawer sửa câu hỏi đóng được bằng Esc, focus không thoát ra ngoài

---

## Phase 4 — Nối dữ liệu thật (khi bạn đã có Neon và R2)

Chưa làm bây giờ. Ghi ở đây để biết Phase 1–3 đang chuẩn bị cho cái gì.

1. Tạo Neon project, đặt `DATABASE_URL`, chạy `prisma migrate dev` và `prisma db seed`
2. Chạy `npx @better-auth/cli generate`, đối chiếu với schema trong repo, nối `prismaAdapter` vào `betterAuth()`, bỏ `ADMIN_EMAILS` và đọc `role` từ bảng `user`
3. Sửa từng file trong `lib/data/` — thay mock bằng truy vấn Prisma. **Chữ ký hàm không đổi, component không đụng tới.**
4. Tạo bucket R2, viết `lib/r2.ts`, sửa `getPlaybackUrl` thành presigned URL hết hạn 10 phút
5. Chuyển thao tác lưu ở admin sang Route Handler thật, thêm `requireAdmin()` và ghi `AuditLog`
6. `grep -rn "TODO(db)\|TODO(r2)" .` — danh sách việc còn lại chính xác đến từng dòng

Nếu Phase 1–3 làm đúng, bước 3 là công việc lặp đi lặp lại chứ không phải viết lại.

---

## Biến môi trường giai đoạn này

```
BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` và các biến `R2_*` chưa cần — thêm ở Phase 4.
