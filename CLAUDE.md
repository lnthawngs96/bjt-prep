# BJT — Web luyện thi tiếng Nhật thương mại

Sản phẩm luyện thi **BJT (ビジネス日本語能力テスト)** cho người Việt. Nội dung do chủ dự án tự viết, nạp qua trang admin.

**Giai đoạn hiện tại: nối database thật (Stage B), tiếp theo là admin (Stage C) và deploy Vercel (Stage D).**
Tầng dữ liệu có hai nguồn cùng chữ ký: có `DATABASE_URL` thì đọc Prisma + Neon, không có thì đọc `mock/`. Đọc kỹ mục "Tầng dữ liệu". Chưa có R2, chưa có SRS.

Ba việc cài đặt còn lại (Neon · Google OAuth · Vercel) nằm ở `docs/setup.md`.

---

## Ngôn ngữ

Trả lời và viết comment bằng **tiếng Việt**. Tên biến, hàm, bảng bằng tiếng Anh.
Giao diện: tiếng Việt. Nội dung đề thi: tiếng Nhật.

---

## Phiên bản

**Luôn cài `@latest`, không bao giờ ghim phiên bản theo trí nhớ.**

Trước khi cài, chạy `npm view <package> version` để biết số thật, rồi ghi lại vào `docs/versions.md`. Kiến thức của model về số phiên bản luôn lạc hậu.

**Nhưng `@latest` không phải lúc nào cũng là bản ổn định.** Kiểm `npm view <package> dist-tags` trước khi cài — có package publish release candidate lên chính tag `latest`. Đúng chuyện đã xảy ra với dự án này: lúc khởi tạo `prisma@latest` trỏ tới `8.0.0-rc.13` trong khi `@prisma/client@latest` là `7.10.0`, cài mù theo `@latest` sẽ ra CLI v8-RC ghép với client v7 và generate hỏng. Xem `docs/versions.md`.

Quy tắc: `@latest` là mặc định, `dist-tags` là bước xác minh, `docs/versions.md` là bản ghi.

Next.js đang ở nhánh 16.x. Ba điểm cần biết:
- React Compiler đã stable nhưng **chưa bật mặc định**. Bật bằng `reactCompiler: true` trong `next.config.ts` và cài `babel-plugin-react-compiler`. Build chậm hơn — cân nhắc, không bắt buộc.
- `revalidateTag` nay cần tham số thứ hai là cacheLife profile. Dạng một tham số đã deprecated.
- **Ghim phiên bản Better Auth.** API plugin của nó vẫn còn thay đổi giữa các bản minor. Đọc release note trước khi nâng.

---

## Stack — đã chốt, không đề xuất thay

| Lớp | Công nghệ |
|---|---|
| Framework | Next.js 16.x, App Router, TypeScript strict |
| Style | **Tailwind CSS v4 thuần** — CSS-first, không shadcn, không thư viện UI nào |
| Icon | `react-icons/fa6` — **chỉ dùng bộ này** |
| Auth | **Better Auth** + plugin `admin()`, Google OAuth |
| State | Zustand (phiên làm bài) + TanStack Query (dữ liệu) |
| Kiểu dữ liệu | Prisma schema → `prisma generate` (không cần DB) |
| Sau này | Neon Postgres · Cloudflare R2 · Vercel |

Không cài thư viện ngoài danh sách mà chưa hỏi.
**Không GSAP, không framer-motion, không shadcn, không Radix, không Headless UI, không MUI.**
Chuyển động chỉ bằng CSS transition.

Ngoại lệ duy nhất đáng cân nhắc: `clsx` và `tailwind-merge`. Chúng không phải thư viện UI, chỉ là hai hàm nhỏ giúp gộp class Tailwind mà không bị xung đột. Nếu không muốn thì tự viết `cn()` bằng template literal, chấp nhận phải cẩn thận hơn khi ghi đè class.

---

## Tầng dữ liệu — phần quan trọng nhất giai đoạn này

Mục tiêu: khi database và R2 sẵn sàng, nối vào chỉ là sửa các file trong `lib/data/`, không đụng một component nào.

### Kiểu dữ liệu lấy thẳng từ Prisma

`prisma/schema.prisma` đã có sẵn và đầy đủ. **`prisma generate` chạy được mà không cần database** — nó chỉ đọc file schema:

```bash
npx prisma generate
```

Prisma 7 sinh client vào `app/generated/prisma` (không còn `node_modules`). Để chỉ có **một** chỗ phải sửa nếu output đổi, mọi type đi qua `lib/prisma-types.ts`:

```ts
// lib/prisma-types.ts — chỗ DUY NHẤT chạm vào đường dẫn generated
export type * from '@/app/generated/prisma/client';
export { Prisma } from '@/app/generated/prisma/client'; // namespace giá trị: DbNull, TransactionClient, lỗi P2002
export * from '@/app/generated/prisma/enums';
```

```ts
// mọi nơi khác
import type { Question, QuestionGroup, VocabEntry, Level, SectionCode } from '@/lib/prisma-types';
```

**Đừng viết tay type song song.** Làm vậy sẽ lệch với schema và sau này phải sửa hai nơi.

### Ba lớp, phân vai rõ ràng

```
prisma/schema.prisma   nguồn sự thật về cấu trúc dữ liệu
mock/                  fixture nội dung, gõ kiểu theo type của Prisma — seed-content.ts nạp nó vào DB
lib/data/              API công khai — chọn nguồn theo DATABASE_URL
  sources/mock/          đọc mock/ (dev không DB, Vitest)
  sources/db/            gọi Prisma (production) — CÙNG chữ ký
```

**Quy tắc tuyệt đối: component không bao giờ import từ `mock/`.** Chỉ import từ `lib/data/`.

```ts
// lib/data/questions.ts — barrel, không có logic
import * as mock from './sources/mock/questions';
import * as dbSource from './sources/db/questions';
import { USE_DB } from './source';

const src: typeof mock = USE_DB ? dbSource : mock; // lệch chữ ký là typecheck gãy
export const { getGroupsForExamBySet, /* … */ } = src;
```

Thêm một hàm mới = viết ở **cả hai** nguồn rồi thêm vào barrel. Mọi hàm `async`. Hàm theo người dùng nhận `userId` (hoặc `userId | null` cho khách). `lib/db.ts` khởi tạo Prisma lười, chỉ khi có truy vấn đầu tiên — import không có DB vẫn an toàn.

Còn chỗ nào chưa làm thì đánh dấu `// TODO(r2):`, `// TODO(srs):`, `// TODO(cron):` để grep lại được.

### Media

Media là file tĩnh trong `public/`; `MediaAsset.r2Key` là đường dẫn tương đối, URL = `'/' + r2Key`. `lib/data/media.ts` xuất `getPlaybackUrl(mediaId): Promise<string>`. Sau này hàm này gọi R2 presigned URL — **chữ ký hàm không đổi**.

---

## Cấu trúc thư mục

```
app/
  (auth)/login/               trang đăng nhập dự phòng cho deep link
  (student)/                  layout có header ngang, ẩn khi cuộn xuống
    page.tsx                        trang chủ
    vocabulary/  grammar/
    practice/[part]/[section]/
    exam/[attemptId]/               KHÔNG header, không nav
    result/[attemptId]/
    mock-test/  ranking/
  (admin)/admin/              layout có sidebar dọc thu gọn được
    questions/  vocabulary/  grammar/  media/  mock-tests/  users/  stats/
  api/auth/[...all]/          Better Auth — toNextJsHandler, KHÔNG phải NextAuth
  generated/prisma/           Prisma Client sinh ra, .gitignore

components/                   CHIA THEO TRANG
  ui/                         primitive TỰ VIẾT: Button, Modal, Drawer, Tabs,
                              Chip, Field, Select, Tooltip, Toast, Badge
  common/                     dùng ở ≥2 trang: ListRow · SectionHeading ·
                              MaterialView · AudioPlayer · Markdown · ScoreRuler ·
                              StartAttemptButton · Theme*
  layout/                     khung học viên: Header · UserMenu
  home/ vocabulary/ grammar/ practice/ mock-test/ exam/ result/ login/ admin/
constants/    common/ + <trang>/
types/        common/ + <trang>/
stores/       common/authDialogStore · exam/examSessionStore
services/api/ common/ + <trang>/   — hàm gọi API đặt tên theo endpoint

lib/                          HẠ TẦNG DÙNG CHUNG, không thuộc trang nào
  data/                       TẦNG TRUY XUẤT — đọc mục trên
    types.ts                        QuestionForExam · QuestionWithAnswer · ExamPart
    source.ts                       USE_DB = Boolean(DATABASE_URL)
    sources/mock/                   đọc mock/
    sources/db/                     gọi Prisma, cùng chữ ký
  validation/                 zod schema cho body request — dùng CHUNG cho
                              server kiểm và client gửi
  prisma-types.ts             chỗ DUY NHẤT chạm đường dẫn client generated
  hooks/  auth.ts  auth-server.ts  db.ts  exam-rules.ts  grading.ts
  scoring.ts  markdown.ts  utils.ts
mock/                         fixture nội dung
prisma/schema.prisma  seed.ts (cấu trúc)  seed-content.ts (nội dung từ mock/)
prisma.config.ts              Prisma 7 — thay cho key "prisma" trong package.json
proxy.ts                      chắn /admin/* khi chưa đăng nhập (Next 16, thay middleware.ts)
tests/                        Vitest — logic thuần và nguồn mock
docs/
```

`lib/data/*.ts` là **API công khai, chữ ký cố định** — barrel chọn nguồn, không có logic. Không component nào biết dữ liệu đến từ đâu.

Hai route group `(student)` và `(admin)` có layout hoàn toàn khác nhau. Đừng gộp.

### Quy ước đặt tên — theo trang, có tiền tố

`app/` chỉ chứa `page.tsx`, `layout.tsx`, `route.ts`. **Không để component cạnh
`page.tsx`** — nó thuộc `components/<trang>/`.

| Loại | Nơi đặt | Tên |
|---|---|---|
| Component riêng một trang | `components/<trang>/` | PascalCase **có tiền tố tên trang**: `ExamRunner`, `VocabularyFlashcards`, `GrammarBrowser` |
| Component dùng ≥2 trang | `components/common/` | tên trần — đường dẫn đã nói lên nó dùng chung |
| Primitive | `components/ui/` | tên trần: `Button`, `Modal` |
| Hằng số | `constants/<trang>/` hoặc `constants/common/` | file camelCase, biến `SCREAMING_SNAKE` có tiền tố: `GRAMMAR_LEVELS`, `LOGIN_PERKS` |
| Type | `types/<trang>/` hoặc `types/common/` | có tiền tố: `MaterialTableBody`. **`Props` của một component thì để nguyên trong file component** |
| Store Zustand | `stores/<trang>/` hoặc `stores/common/` | `<tên>Store.ts` |
| Gọi API từ client | `services/api/<trang>/` | **tên hàm theo endpoint**: `POST /api/attempts` → `handlePostAttempts`; `POST /api/attempts/[id]/submit` → `handlePostAttemptSubmit` |

Thư mục dùng kebab-case trùng tên route segment (`mock-test`).

Component **không tự gọi `fetch`**. Mọi lời gọi đi qua `services/api/`, trả
`ApiResult<T>` đã phân loại mã lỗi (`services/api/common/apiResult.ts`) — chỗ gọi
`switch` trên `code` chứ không đọc `res.status`.

---

## Quy tắc giao diện

### Nền và bố cục
- **Một tone nền duy nhất** (`--bg`). Không vùng nào nền khác.
- Phân tách bằng **đường kẻ 1px** và khoảng trắng. **KHÔNG dùng card trắng bo góc** cho nội dung chính.
- Nội dung học viên: một khung, `max-width: 1000px`, căn giữa.
- Điểm nhấn tạo bằng cỡ chữ và khoảng trắng, không bằng khối màu.

### Dùng class có sẵn, đừng viết arbitrary value

**Ưu tiên class chuẩn của Tailwind.** `text-sm` chứ không `text-[13.5px]`,
`rounded-lg` chứ không `rounded-[9px]`, `max-w-prose` chứ không `max-w-[62ch]`.

Thứ Tailwind **thật sự không có** — gradient thương hiệu, shadow màu, đường cong
easing riêng, animation, bề rộng khung 1000px, mốc 860px — thì khai thành **token
trong `@theme inline`** của `app/globals.css` rồi dùng bằng tên: `shadow-btn`,
`ease-smooth`, `animate-dialog-rise`, `max-w-content`, `max-nav:`, `nav:`.

Chỉ để lại arbitrary value khi giá trị là hình học của một hiệu ứng cụ thể và đặt
tên cho nó chỉ làm rối. Trước khi thêm một cái mới, hỏi: cái này có nên là token không?

### Màu
```css
--g: linear-gradient(116deg,#1B4FD8 0%,#2E8FE0 46%,#23C9C2 100%);
--g-ng: linear-gradient(90deg,#C7365A,#E0754B);   /* chỉ cho thanh điểm yếu */
```
Gradient chỉ cho: logo, nút chính, số điểm lớn, tên phần cỡ lớn, chip đang chọn, gạch chân tab, badge, viền active.
**Không bao giờ** cho chữ nội dung — mất contrast, app này ngồi hai tiếng.

Sáng: nền `#FFFFFF` · chữ `#0A1828` · accent `#1C6FD4`
Tối: nền `#07121E` · chữ `#DEEAF6` · accent `#4C9CEC`

Tất cả qua CSS variable, dark mode là swap biến. `next-themes` + `suppressHydrationWarning` trên `<html>`.

**Tailwind v4 không có `tailwind.config.ts`.** Token khai báo bằng `@theme inline` ngay trong `app/globals.css`:

```css
@import "tailwindcss";
@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  /* fg2 fg3 ln ln2 acc acc-hi acc-soft acc-dim ok ng wr ... */
}
```

Kéo theo một thay đổi cú pháp dễ sót: **arbitrary value đọc CSS variable ở v4 viết bằng ngoặc tròn**, không phải ngoặc vuông.

```
v3 (SAI ở đây):  bg-[--ov]     backdrop:bg-[--ov]
v4 (ĐÚNG):       bg-(--ov)     backdrop:bg-(--ov)
```

`bg-[--ov]` ở v4 bị hiểu là tên màu chứ không phải biến, và **hỏng im lặng** — không báo lỗi, chỉ không ra màu.

### Font
- `Be Vietnam Pro` — tiếng Việt và giao diện
- `BIZ UDPGothic` — mọi văn bản tiếng Nhật, class `.jp`
- Nạp bằng `next/font/google`, có subset

### Primitive tự viết

Không có thư viện UI. `components/ui/` là của bạn, viết bằng Tailwind thuần.

**Modal và Drawer bắt buộc dùng thẻ `<dialog>` gốc** với `showModal()`. Nó cho sẵn focus trap, phím Esc, backdrop và `inert` cho nền — những thứ tự viết rất dễ sai:

```tsx
const ref = useRef<HTMLDialogElement>(null);
// mở:  ref.current?.showModal()
// đóng: ref.current?.close()
// backdrop: <dialog className="backdrop:bg-(--ov) backdrop:backdrop-blur-sm">
// click ra ngoài: onClick e.target === ref.current thì close()
```

Trả focus về nút đã mở là hành vi mặc định của `<dialog>`, đừng tự làm lại.

Các primitive còn lại:
- **Tabs** — `role="tablist"` + `aria-selected`, xử lý phím mũi tên trái/phải
- **Select** — `<select>` gốc, style bằng `appearance-none` + icon riêng. Chỉ tự viết listbox khi thật sự cần tuỳ biến
- **Tooltip** — CSS thuần, `opacity` + `pointer-events-none`, có `aria-describedby`
- **Dropdown** — `<details>`/`<summary>` cho menu đơn giản
- **Toast** — một context nhỏ + `<div>` cố định, `role="status"`

### Điều hướng
- **Học viên**: nav ngang trên header, ẩn khi cuộn xuống quá 90px, hiện khi cuộn lên. Dưới 860px thu thành hamburger.
- **Admin**: sidebar dọc trái, mặc định 60px chỉ icon, mở ra 216px. Hamburger ở **đầu** sidebar.
- **Màn hình làm bài**: không header, không sidebar. Chỉ đồng hồ, dãy số câu, nút Thoát.
- **Điều hướng trong màn làm bài đổi theo `AttemptMode`** — xem mục "Điều hướng màn làm bài" bên dưới.
- Mục "Quản trị" trên header học viên chỉ hiện khi `role === 'ADMIN'`.

### Chuyển động
Chỉ CSS transition, bọc trong `prefers-reduced-motion`.
Màn hình làm bài không có hiệu ứng vào trang — người dùng bấm "Câu tiếp theo" 80 lần trong hai tiếng.

---

## Chấm điểm

**10 điểm mỗi câu.** 80 câu × 10 = 800.

```ts
const score = correctCount * 10;
const level = score >= 600 ? 'J1_PLUS' : score >= 530 ? 'J1'
            : score >= 420 ? 'J2' : score >= 320 ? 'J3'
            : score >= 200 ? 'J4' : 'J5';
```

Chỉ quy ra thang 800 cho **đề thi thử đủ 80 câu**. Bộ luyện tập chỉ hiện `8/10` và tỉ lệ đúng.
Giao diện luôn ghi **"điểm tham khảo"** — BJT không công bố 配点 thật.

---

## Cấu trúc đề BJT — cố định

| Phần | Tên | Câu | Thời gian |
|---|---|---|---|
| LISTENING | 聴解 | 25 | 45 phút |
| LISTENING_READING | 聴読解 | 25 | 30 phút |
| READING | 読解 | 30 | 30 phút |

Chín section: L1 場面把握 (5) · L2 発言聴解 (10) · L3 総合聴解 (10) · LR1 状況把握 (5) · LR2 資料聴読解 (10) · LR3 総合聴読解 (10) · R1 語彙・文法 (10) · R2 表現読解 (10) · R3 総合読解 (10)

Bậc: J5 0–199 · J4 200–319 · J3 320–419 · J2 420–529 · J1 530–599 · J1+ 600–800

Đơn vị dữ liệu trung tâm là **`QuestionGroup` (大問), không phải `Question`** — một audio hoặc một bảng số liệu phục vụ nhiều câu. Mọi câu đều thuộc một group, kể cả câu đứng một mình.

---

## Điều hướng màn làm bài — bám theo CBT thật

BJT thật là CBT **tuyến tính**: audio phát **một lần**, và ở phần 聴解/聴読解 **không lùi lại câu trước được**. Nếu cho nhảy câu tự do ở chế độ thi thử thì học viên quen được lùi, đi thi thật sẽ sốc.

Store phiên làm bài giữ `navigationMode`, suy ra từ `AttemptMode` và phần đang làm:

| Chế độ | Điều hướng | Audio |
|---|---|---|
| `MOCK` — phần 聴解 / 聴読解 | Tuyến tính. Dãy số chỉ hiển thị trạng thái, **không bấm được** | Phát 1 lần, `playOnce` |
| `MOCK` — phần 読解 | Lùi và nhảy tự do **trong phần**, không sang phần khác | — |
| `PRACTICE` · `REVIEW` · `WEAKNESS` | Tự do hoàn toàn | Nghe lại thoải mái |

Không cần thêm cột nào vào schema — `AttemptMode` và `sectionCode` đã đủ dữ kiện.

---

## Quy tắc bảo mật — áp dụng NGAY từ giai đoạn tĩnh

Thiết kế sai từ bây giờ thì sau này phải viết lại.

1. **Không để `isCorrect` lọt xuống client trước khi nộp bài.** Ngay cả với mock, hàm trả câu hỏi cho màn thi phải lọc bỏ trường này.
2. Màn thi nhận kiểu riêng `QuestionForExam` — **không có** `isCorrect`, `explanationVi`, `distractorNote`, `businessNoteVi`. Ép bằng TypeScript, đừng dựa vào kỷ luật.
3. Chỉ sau khi nộp mới trả kiểu đầy đủ `QuestionWithAnswer`.
4. Chấm điểm luôn ở phía server, kể cả khi dữ liệu còn là mock.
5. Giữ nguyên chữ ký `getPlaybackUrl(mediaId): Promise<string>` để sau này thay bằng presigned URL không phải sửa gì.

---

## Quy tắc nghiệp vụ đã chốt thêm (08/09/2026)

- **Phương án ở L1 場面把握, L2 発言聴解, LR1 状況把握 được đọc trong audio.** `QuestionOption.textJa` là `String?`; khi mọi phương án của một câu không có chữ, màn thi hiện lưới bốn nút số. Transcript của audio ghi lại câu hỏi và bốn phương án để admin soát và màn xem lại dùng.
- **Đề thi thử chia PHẦN, mỗi phần một đồng hồ.** `buildExamParts` trong `lib/exam-rules.ts` gom group theo Part; hết giờ hoặc bấm "Kết thúc phần" thì sang phần kế và phần cũ khoá. Luyện tập là một phần.
- **Mọi quy tắc chấm nằm trong `lib/grading.ts`**, dùng chung cho nguồn mock và DB: không nộp lại, chỉ chấm câu thuộc đề, từ chối nộp trễ quá `SUBMIT_GRACE_SEC`. Sửa quy tắc thì sửa ở đó và thêm test.
- **Hàm tầng dữ liệu theo người dùng nhận `userId`** (`getAttempt(id, userId)`, `getMockTests(userId | null)`…). Lượt làm bài của người khác trả `null`, trang trả 404.
- **DOCUMENT chỉ là markdown**, render qua `components/common/Markdown.tsx`. Không `dangerouslySetInnerHTML` ở bất cứ đâu.
- **Next 16 dùng `proxy.ts`** thay cho `middleware.ts`, cùng vai trò.

## Thói quen

- Đặt file mới theo bảng "Quy ước đặt tên" ở mục Cấu trúc thư mục. Không để component cạnh `page.tsx`.
- Chạy `npm run typecheck`, `npm run lint` và `npm test` trước khi commit. Test bằng Vitest, nằm trong `tests/`, chỉ cho logic thuần và nguồn mock.
- Không tự thêm tính năng ngoài việc đang làm.
- Không sửa `prisma/schema.prisma` mà không hỏi — nó là nguồn sự thật của cả dự án.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
