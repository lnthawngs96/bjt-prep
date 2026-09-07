# BJT — Kế hoạch dữ liệu và hạ tầng

Phiên bản 1. Dùng làm tài liệu tham chiếu khi dựng dự án bằng Claude Code.

---

## 0. Quyết định hạ tầng

### Backend: viết luôn trong Next.js

Không tách NodeJS/NestJS riêng ở giai đoạn này.

| Lý do | Chi tiết |
|---|---|
| Một người làm | Một repo, một lệnh deploy, một hệ type dùng chung giữa FE và BE |
| Không CORS, không auth kép | Session của Better Auth đọc trực tiếp trong Route Handler |
| Bảo vệ ngân hàng đề | Câu hỏi chỉ đi qua Route Handler phía server, không expose bảng ra client |
| Đủ nhanh | Route Handlers + Server Actions xử lý tốt CRUD và chấm điểm |

Dùng Route Handlers (`app/api/**/route.ts`) cho mọi thứ client cần gọi, Server Actions cho form trong admin.

**Khi nào mới cần tách BE riêng:** khi có job chạy nền lâu — cắt audio, transcode, chuẩn hoá loudness, sinh waveform. Lúc đó dựng một worker nhỏ trên Railway hoặc Fly.io, không phải viết lại toàn bộ. NestJS chỉ đáng dùng khi có nhiều hơn ba lập trình viên cùng chạm vào BE.

### Các lựa chọn còn lại

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Database | **Neon** (Postgres) | Serverless driver hợp Vercel, có branching để test migration. Supabase bị loại vì kiến trúc: client không bao giờ chạm DB (xem mục 11), nên RLS — thứ mạnh nhất của Supabase — vô dụng ở đây |
| ORM | **Prisma** | Prisma Studio cho bạn nhập dữ liệu ngay từ tuần đầu, trước khi admin panel xong. Đây là lý do thực dụng, không phải sở thích |
| Lưu audio + ảnh | **Cloudflare R2** | Egress miễn phí. Nội dung của bạn nặng audio, để trên Vercel sẽ đắt kinh khủng |
| Phát audio | **Presigned URL hết hạn 10 phút** | Không bao giờ trả URL R2 gốc ra client, nếu không cả kho audio bị hút sạch |
| Auth | **Better Auth** + plugin `admin()` | Self-hosted, user nằm trong Postgres của bạn, session có type sẵn, RBAC là plugin chính chủ, không phí theo MAU. Ghim phiên bản chính xác |
| State | Zustand | Chỉ cho state phiên làm bài. Dữ liệu server dùng TanStack Query |
| Email | Resend | Nhắc lịch ôn, xác nhận tài khoản |
| Lỗi | Sentry | |
| Phân tích | PostHog | Theo dõi phễu free → trả phí sau này |
| Thanh toán | PayOS (để sau) | Phase 1 miễn phí, nhưng tách sẵn interface |

**Prisma trên serverless** cần bật driver adapter của Neon để tránh cạn connection:

```ts
import { PrismaNeon } from '@prisma/adapter-neon';
```

---

## 1. Nguyên tắc thiết kế

Ba câu hỏi tôi hỏi bạn nhiều lần, giờ tôi tự chốt theo phương án linh hoạt nhất:

**1. Câu hỏi dùng lại được ở nhiều nơi.** Một nhóm câu hỏi có thể vừa nằm trong bộ luyện tập, vừa nằm trong đề thi thử số 3, vừa nằm trong bộ "ôn điểm yếu". Nối bằng bảng trung gian, không nhúng cứng.

**2. Audio là một file dài cho cả nhóm, cắt theo timestamp.** Đây là cách BJT thật hoạt động: một đoạn hội thoại rồi hỏi ba câu về nó. Mỗi câu lưu `audio_start_ms` / `audio_end_ms` để lúc xem lại có thể phát đúng đoạn liên quan. Lúc thi thì phát liền mạch cả file.

**3. Có liên kết ngược.** `question_vocab` và `question_grammar` cho phép sau khi làm sai thì gợi ý đúng từ và mẫu ngữ pháp cần ôn. Đây là thứ biến app từ "ngân hàng đề" thành "lộ trình học".

### Đơn vị trung tâm: `question_group` (大問)

Không phải `question`. Lý do: trong 総合聴解 và 資料聴読解, một tài liệu hoặc một đoạn audio phục vụ nhiều câu hỏi. Nếu lấy câu hỏi làm đơn vị thì tài liệu bị nhân bản.

Quy ước: **mọi câu hỏi đều thuộc một group**, kể cả câu 語彙・文法 đứng một mình — group đó có 1 câu và 0 tài liệu. Một đường đi duy nhất, query đơn giản hơn nhiều so với việc xử lý hai trường hợp.

```
media_asset ──< material ──< group_material >── question_group ──< question ──< question_option
                                                      │                │
                                    question_set_item ┤                ├─< question_tag
                                    mock_test_item ────┘                ├─< question_vocab
                                                                        └─< question_grammar
```

---

## 2. Enum

```prisma
enum Part            { LISTENING LISTENING_READING READING }
enum SectionCode     { L1 L2 L3 LR1 LR2 LR3 R1 R2 R3 }
enum Level           { J5 J4 J3 J2 J1 J1_PLUS }
enum ContentStatus   { DRAFT NEEDS_AUDIO NEEDS_REVIEW PUBLISHED FLAGGED ARCHIVED }
enum MaterialKind    { AUDIO DOCUMENT IMAGE TABLE CHART }
enum Register        { SONKEIGO KENJOUGO TEINEIGO PLAIN WRITTEN }
enum PartOfSpeech    { NOUN VERB_U VERB_RU VERB_IRR I_ADJ NA_ADJ ADVERB EXPRESSION COUNTER }
enum UserRole        { USER EDITOR ADMIN }
enum AttemptMode     { PRACTICE MOCK REVIEW WEAKNESS }
enum CardType        { VOCAB GRAMMAR }
enum SrsState        { NEW LEARNING REVIEW RELEARNING }
```

---

## 3. Bảng cấu trúc đề (seed, gần như không đổi)

### `parts` — 3 dòng

| code | name_ja | name_vi | question_count | time_limit_sec |
|---|---|---|---|---|
| LISTENING | 聴解 | Nghe hiểu | 25 | 2700 |
| LISTENING_READING | 聴読解 | Nghe kèm đọc | 25 | 1800 |
| READING | 読解 | Đọc hiểu | 30 | 1800 |

### `sections` — 9 dòng

| code | part | name_ja | name_vi | count | has_audio | has_material |
|---|---|---|---|---|---|---|
| L1 | LISTENING | 場面把握問題 | Nắm bắt tình huống | 5 | ✓ | ảnh |
| L2 | LISTENING | 発言聴解問題 | Nghe hiểu phát ngôn | 10 | ✓ | – |
| L3 | LISTENING | 総合聴解問題 | Nghe hiểu tổng hợp | 10 | ✓ | – |
| LR1 | LISTENING_READING | 状況把握問題 | Nắm bắt bối cảnh | 5 | ✓ | ảnh |
| LR2 | LISTENING_READING | 資料聴読解問題 | Nghe kèm tài liệu | 10 | ✓ | bảng/biểu đồ |
| LR3 | LISTENING_READING | 総合聴読解問題 | Nghe-đọc tổng hợp | 10 | ✓ | ✓ |
| R1 | READING | 語彙・文法問題 | Từ vựng và ngữ pháp | 10 | – | – |
| R2 | READING | 表現読解問題 | Đọc hiểu diễn đạt | 10 | – | ✓ |
| R3 | READING | 総合読解問題 | Đọc hiểu tổng hợp | 10 | – | ✓ |

Cột `question_count` dùng để validate: một đề thi thử hợp lệ phải khớp đủ 9 con số này.

---

## 4. Nội dung đề thi

### `media_assets`

Mọi file trên R2 đi qua bảng này. Đây là bảng cho bạn biết "còn 41 câu chờ audio".

```prisma
model MediaAsset {
  id          String   @id @default(cuid())
  r2Key       String   @unique          // bjt/audio/lr2-007.mp3
  mime        String
  bytes       Int
  durationMs  Int?
  checksum    String?
  waveform    Json?                     // mảng peak để vẽ sóng, tính sẵn lúc upload
  uploadedBy  String?
  createdAt   DateTime @default(now())
}
```

### `materials` — vật liệu đề bài

```prisma
model Material {
  id          String       @id @default(cuid())
  kind        MaterialKind
  titleAdmin  String                    // tên nội bộ, không hiện cho học viên
  mediaId     String?                   // AUDIO hoặc IMAGE
  media       MediaAsset?  @relation(fields: [mediaId], references: [id])

  transcript  Json?                     // [{ speaker, role, text, startMs, endMs }]
  body        Json?                     // DOCUMENT: { format, content }
                                        // TABLE:    { headers, rows, caption }
                                        // CHART:    { chartType, series, axisLabels }
  altText     String?
  status      ContentStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

`transcript` có `startMs`/`endMs` từng lượt nói. Đây là thứ cho phép màn hình xem lại đánh dấu đúng câu mà học viên nghe sót — tính năng không đối thủ nào có, và gần như miễn phí nếu lưu đúng từ đầu.

### `question_groups`

```prisma
model QuestionGroup {
  id            String        @id @default(cuid())
  sectionCode   SectionCode
  level         Level
  titleAdmin    String
  instructionJa String?                 // 次の会話を聞いて、質問に答えてください
  instructionVi String?
  status        ContentStatus @default(DRAFT)
  materials     GroupMaterial[]
  questions     Question[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([sectionCode, level, status])
}

model GroupMaterial {
  groupId    String
  materialId String
  order      Int
  @@id([groupId, materialId])
}
```

### `questions`

```prisma
model Question {
  id            String        @id @default(cuid())
  groupId       String
  group         QuestionGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  order         Int                     // thứ tự trong group
  sectionCode   SectionCode             // lặp lại để query nhanh, đồng bộ với group
  level         Level

  stemJa        String                  // 課長が指示した内容として、最も適切なものは…
  stemFurigana  Json?
  stemVi        String?                 // bản dịch, chỉ hiện ở chế độ xem lại

  audioStartMs  Int?                    // đoạn audio ứng với câu này
  audioEndMs    Int?

  explanationVi String?                 // vì sao đáp án đúng
  businessNoteVi String?                // bối cảnh công sở Nhật cần biết

  difficulty    Float?                  // tính từ dữ liệu làm bài thật
  discrimination Float?                 // câu này phân loại giỏi/kém tốt không
  status        ContentStatus @default(DRAFT)

  options       QuestionOption[]
  createdById   String?
  reviewedById  String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([sectionCode, level, status])
  @@index([groupId, order])
}

model QuestionOption {
  id             String   @id @default(cuid())
  questionId     String
  order          Int                    // 1..4
  textJa         String
  isCorrect      Boolean  @default(false)
  distractorNote String?                // vì sao phương án này sai
  @@unique([questionId, order])
}
```

`distractorNote` là chỗ tôi khuyên bạn đừng bỏ trống. Với người học chưa đi làm, biết vì sao ba phương án kia sai còn quan trọng hơn biết phương án nào đúng.

`difficulty` và `discrimination` để trống lúc đầu, tính bằng cron sau khi có vài trăm lượt làm. Có hai số này thì mới ước lượng điểm tử tế và mới biết câu nào cần viết lại.

### Bộ luyện tập và đề thi thử

```prisma
model QuestionSet {
  id          String        @id @default(cuid())
  sectionCode SectionCode
  level       Level
  indexNo     Int                       // "bộ 7"
  titleVi     String                    // Doanh số theo khu vực
  descVi      String?
  estMinutes  Int?
  status      ContentStatus @default(DRAFT)
  items       QuestionSetItem[]
  @@unique([sectionCode, indexNo])
}

model QuestionSetItem {
  setId   String
  groupId String
  order   Int
  @@id([setId, groupId])
}

model MockTest {
  id          String   @id @default(cuid())
  code        String   @unique          // MT-01
  titleVi     String                    // Đề thi thử số 1
  status      ContentStatus @default(DRAFT)
  publishedAt DateTime?
  items       MockTestItem[]
}

model MockTestItem {
  mockTestId  String
  groupId     String
  sectionCode SectionCode
  order       Int
  @@id([mockTestId, groupId])
}
```

Trước khi `PUBLISHED`, chạy kiểm tra: tổng câu theo từng section phải khớp bảng `sections` (5/10/10, 5/10/10, 10/10/10 = 80).

### Nhãn kỹ năng — nguồn của "Đang yếu nhất"

```prisma
model Tag {
  id       String @id @default(cuid())
  slug     String @unique               // keigo-phone
  nameVi   String                       // Kính ngữ trong hội thoại điện thoại
  nameJa   String?
  category String                       // skill | scenario | function
}

model QuestionTag {
  questionId String
  tagId      String
  @@id([questionId, tagId])
}
```

Đây là bảng quyết định app có hữu ích hay không. Không có nó, bạn chỉ nói được "bạn yếu phần 聴読解" — quá chung để hành động. Có nó thì nói được "bạn sai 62% các câu về chỉ thị gián tiếp của cấp trên".

Bộ nhãn khởi đầu tôi đề xuất:

*Chức năng ngôn ngữ:* 敬語 điện thoại · 敬語 gặp mặt · chỉ thị gián tiếp · từ chối lịch sự · xin lỗi khách hàng · đề nghị và xin phép · báo cáo tiến độ · xác nhận lại thông tin

*Loại tài liệu:* email nội bộ · email khách hàng · thông báo · biên bản họp · biểu đồ cột · biểu đồ đường · bảng số liệu · 稟議書 · lịch trình

*Bối cảnh:* họp · điện thoại · tiếp khách · 名刺交換 · báo cáo cấp trên · trao đổi với đồng nghiệp

---

## 5. Từ vựng

```prisma
model VocabTopic {
  id      String @id @default(cuid())
  slug    String @unique                // kaigi-houkoku
  nameVi  String                        // Họp hành và báo cáo
  nameJa  String?                       // 会議・報告
  order   Int
}

model VocabEntry {
  id           String       @id @default(cuid())
  headword     String                   // 稟議書
  readingKana  String                   // りんぎしょ
  accent       Int?                     // vị trí xuống giọng, kiểu Tokyo
  pos          PartOfSpeech
  meaningVi    String
  meaningEn    String?
  level        Level
  topicId      String?
  register     Register?                // từ này thuộc tầng lịch sự nào
  audioId      String?
  noteVi       String?                  // dùng khi nào, tránh nhầm với từ nào
  status       ContentStatus @default(DRAFT)
  examples     VocabExample[]
  @@unique([headword, readingKana])
  @@index([topicId, level, status])
}

model VocabExample {
  id            String  @id @default(cuid())
  vocabId       String
  sentenceJa    String
  sentenceKana  String?
  meaningVi     String
  contextTag    String?                 // email | meeting | phone
  audioId       String?
  order         Int
}

model VocabRelation {
  vocabId   String
  relatedId String
  relation  String                      // synonym | antonym | sonkeigo | kenjougo | teineigo
  @@id([vocabId, relatedId, relation])
}
```

`VocabRelation` với `relation = sonkeigo | kenjougo` là thứ đặc thù của tiếng Nhật thương mại và là chỗ app của bạn có thể vượt xa từ điển thường: 言う → おっしゃる (tôn kính) / 申す (khiêm nhường). Người học BJT sai chỗ này nhiều nhất.

`register` trên từng từ cũng vậy. Cùng nghĩa "xem" nhưng 見る / ご覧になる / 拝見する dùng ở ba tình huống khác nhau, chọn nhầm là mất điểm.

---

## 6. Ngữ pháp

```prisma
model GrammarPoint {
  id             String       @id @default(cuid())
  slug           String       @unique   // sasete-itadaku
  pattern        String                 // 〜させていただく
  formation      String                 // V使役形 + ていただく
  meaningVi      String
  register       Register
  level          Level
  usageNoteVi    String?                // dùng khi xin phép làm gì đó với người trên
  commonMistakeVi String?               // lỗi người Việt hay mắc
  jlptLevel      String?                // N2, tham chiếu chéo khi thêm phần JLPT sau
  status         ContentStatus @default(DRAFT)
  examples       GrammarExample[]
}

model GrammarExample {
  id         String  @id @default(cuid())
  grammarId  String
  sentenceJa String
  meaningVi  String
  contextTag String?                    // email | meeting | phone | report
  isNegative Boolean @default(false)    // ví dụ về cách dùng SAI
  audioId    String?
  order      Int
}
```

`isNegative` cho phép lưu ví dụ phản diện — "câu này sai vì dùng 尊敬語 cho hành động của chính mình". Học ngữ pháp kính ngữ mà không thấy ví dụ sai thì rất khó nhớ.

`jlptLevel` để trống cũng được, nhưng có sẵn cột thì sau này thêm phần JLPT bổ trợ không cần migration.

---

## 7. Liên kết ngược

```prisma
model QuestionVocab {
  questionId String
  vocabId    String
  relevance  String                     // tested | appears
  @@id([questionId, vocabId])
}

model QuestionGrammar {
  questionId String
  grammarId  String
  relevance  String
  @@id([questionId, grammarId])
}
```

Luồng dùng: học viên sai câu Q-0412 → hệ thống thấy câu này gắn `sasete-itadaku` với `relevance = tested` → màn hình kết quả hiện thẻ "Ngữ pháp cần ôn" → bấm vào thì thêm thẳng vào hàng đợi SRS.

---

## 8. Người dùng và tiến độ học

### Better Auth

Bốn model `User` / `Session` / `Account` / `Verification` theo chuẩn Better Auth, kèm plugin `admin()` thêm `role`, `banned`, `banReason`, `banExpires` vào `User` và `impersonatedBy` vào `Session`.

Chi tiết xem `prisma/schema.prisma`. **Trước khi migrate luôn chạy `npx @better-auth/cli generate` để đối chiếu** — schema của Better Auth đổi giữa các phiên bản.

Trường riêng của dự án thêm vào `User`: `locale`.

```prisma
model UserProfile {
  userId           String   @id
  targetLevel      Level?
  examDate         DateTime?
  dailyGoalMinutes Int      @default(20)
  timezone         String   @default("Asia/Ho_Chi_Minh")
}
```

### SRS

Dùng **FSRS** chứ đừng tự viết SM-2. Thư viện `ts-fsrs` chạy được cả trên server lẫn client, và FSRS cho lịch ôn chính xác hơn đáng kể với cùng lượng thời gian bỏ ra.

```prisma
model SrsCard {
  id            String   @id @default(cuid())
  userId        String
  cardType      CardType
  refId         String                  // vocabId hoặc grammarId
  dueAt         DateTime
  stability     Float
  difficulty    Float
  elapsedDays   Int      @default(0)
  scheduledDays Int      @default(0)
  reps          Int      @default(0)
  lapses        Int      @default(0)
  state         SrsState @default(NEW)
  lastReviewAt  DateTime?
  @@unique([userId, cardType, refId])
  @@index([userId, dueAt])              // truy vấn nóng nhất của cả app
}

model SrsReview {
  id         String   @id @default(cuid())
  cardId     String
  userId     String
  rating     Int                        // 1 again · 2 hard · 3 good · 4 easy
  durationMs Int?
  reviewedAt DateTime @default(now())
  @@index([userId, reviewedAt])
}
```

Giữ `SrsReview` đầy đủ. Sau vài tháng bạn có thể chạy tối ưu tham số FSRS trên chính dữ liệu người Việt học tiếng Nhật — thứ không ai khác có.

### Lượt làm bài

```prisma
model Attempt {
  id              String      @id @default(cuid())
  userId          String
  mode            AttemptMode
  questionSetId   String?
  mockTestId      String?
  startedAt       DateTime    @default(now())
  finishedAt      DateTime?
  timeSpentSec    Int?
  rawCorrect      Int         @default(0)
  totalQuestions  Int
  estimatedScore  Int?                  // 0..800
  estimatedLevel  Level?
  perSection      Json?                 // { L1: {correct, total}, ... }
  answers         AttemptAnswer[]
  @@index([userId, startedAt])
}

model AttemptAnswer {
  id               String   @id @default(cuid())
  attemptId        String
  questionId       String
  selectedOptionId String?               // null = bỏ trống
  isCorrect        Boolean
  timeSpentMs      Int?
  flagged          Boolean  @default(false)
  answeredAt       DateTime @default(now())
  @@unique([attemptId, questionId])
  @@index([questionId])                  // để tính độ khó của câu
}
```

### Thống kê điểm yếu

```prisma
model UserSkillStat {
  userId     String
  dimension  String                     // section | tag
  key        String                     // L3 hoặc keigo-phone
  attempts   Int
  correct    Int
  accuracy   Float
  updatedAt  DateTime
  @@id([userId, dimension, key])
}
```

Bảng dẫn xuất, cập nhật bằng cron mỗi giờ hoặc bằng trigger sau mỗi attempt. Đừng tính trực tiếp từ `AttemptAnswer` mỗi lần vào trang chủ — nó sẽ chậm dần và bạn không nhận ra cho tới khi có 500 người dùng.

---

## 9. Chấm điểm

配点 của BJT không được công bố, nên không cố mô phỏng. Dùng cách đơn giản nhất và nói thật với học viên rằng đây là điểm tham khảo.

### Công thức

**10 điểm mỗi câu.** 80 câu × 10 = 800. Tỉ trọng tự khớp với cấu trúc đề:

| Phần | Số câu | Điểm tối đa |
|---|---|---|
| 聴解 | 25 | 250 |
| 聴読解 | 25 | 250 |
| 読解 | 30 | 300 |

```ts
export const POINTS_PER_QUESTION = 10;

export function scoreAttempt(correct: number) {
  const score = correct * POINTS_PER_QUESTION;
  const level =
    score >= 600 ? 'J1_PLUS' :
    score >= 530 ? 'J1'      :
    score >= 420 ? 'J2'      :
    score >= 320 ? 'J3'      :
    score >= 200 ? 'J4'      : 'J5';
  return { score, level };
}
```

### Quy tắc: chỉ đề đủ 80 câu mới quy ra thang 800

`Attempt.estimatedScore` chỉ điền khi `mode = MOCK`. Với `PRACTICE`, để `null` và chỉ hiện `8/10` cùng tỉ lệ đúng.

Lý do: ngoại suy thang 800 từ một bộ 10 câu làm điểm dao động 200 đơn vị chỉ vì đoán trúng một câu. Học viên sẽ thấy điểm nhảy loạn giữa các buổi và mất niềm tin vào con số.

### Ngôn từ trên giao diện

Dùng "điểm tham khảo" hoặc "điểm ước tính", không dùng "điểm của bạn". Kèm một dòng giải thích ngắn ở trang kết quả: cách tính là 10 điểm mỗi câu, không phải công thức chính thức của BJT vì tổ chức không công bố.

### Cấu hình

```prisma
model ScoringConfig {
  id        String   @id @default("active")
  version   Int      @default(1)
  rules     Json     // { "pointsPerQuestion": 10 }
  updatedAt DateTime @updatedAt
}

model ScoringBand {
  level    Level  @id
  minScore Int
  maxScore Int
}
```

Seed `ScoringBand`: J5 0–199 · J4 200–319 · J3 320–419 · J2 420–529 · J1 530–599 · J1+ 600–800.

### `difficulty` và `discrimination` — đổi mục đích

Hai cột này **không dùng để chấm điểm**. Chúng dùng để soát chất lượng nội dung:

- Câu có tỉ lệ đúng dưới 10% → nhiều khả năng đáp án nhập sai hoặc đề mơ hồ, không phải câu khó
- Câu có tỉ lệ đúng trên 95% → quá dễ, không phân loại được ai
- Câu mà người điểm cao và người điểm thấp làm đúng ngang nhau → câu hỏng

Với người tự viết toàn bộ đề, đây là cơ chế tự kiểm tra rẻ nhất. Đưa lên bảng admin thành một cột "tỉ lệ đúng" kèm bộ lọc "câu nghi vấn" là đủ dùng.

Tính bằng cron hàng ngày từ `AttemptAnswer`, chỉ chạy cho câu đã có ít nhất 30 lượt làm.

### Màn hình kết quả mới là thứ quan trọng

Con số điểm chỉ để học viên thấy mình tiến bộ theo thời gian. Giá trị thật nằm ở màn hình sau khi nộp:

- Câu nào sai
- Vì sao đáp án đúng là đúng — `Question.explanationVi`
- Ba phương án kia sai ở đâu — `QuestionOption.distractorNote`
- Bối cảnh công sở cần biết — `Question.businessNoteVi`
- Từ và ngữ pháp cần ôn — `QuestionVocab`, `QuestionGrammar`, thêm thẳng vào hàng đợi SRS
- Với câu nghe: phát lại đúng đoạn audio liên quan — `audioStartMs` / `audioEndMs`

## 10. Vận hành

```prisma
model QuestionReport {
  id         String   @id @default(cuid())
  questionId String
  userId     String?
  reason     String                     // wrong_answer | typo | audio_broken | unclear
  detail     String?
  status     String   @default("open")
  resolvedBy String?
  resolvedAt DateTime?
  createdAt  DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  entity    String
  entityId  String
  action    String                      // create | update | delete | publish
  diff      Json?
  createdAt DateTime @default(now())
}
```

`AuditLog` nghe thừa với dự án một người, nhưng khi bạn sửa nhầm đáp án của 30 câu lúc 2 giờ sáng thì nó là thứ duy nhất cứu được bạn.

---

## 11. Bảo vệ nội dung

Ngân hàng đề là tài sản duy nhất của sản phẩm. Bốn quy tắc bắt buộc:

1. **Client không bao giờ query trực tiếp bảng câu hỏi.** Mọi thứ qua Route Handler.
2. **Không gửi `isCorrect` xuống client trước khi nộp.** Endpoint trả câu hỏi chỉ trả `id`, `textJa`, `order` của từng phương án. Chấm điểm ở server.
3. **Trả theo phiên, không trả cả bộ.** Bắt đầu attempt thì tạo bản ghi, mỗi lần chỉ trả nhóm câu tiếp theo.
4. **URL audio là presigned, hết hạn 10 phút, gắn với attempt đang mở.**

Thêm rate limit theo `userId` (không phải IP — sinh viên dùng chung wifi ký túc xá sẽ bị chặn oan).

---

## 12. Thứ tự dựng

| Bước | Việc | Ghi chú |
|---|---|---|
| 1 | Prisma schema + migrate lên Neon | Seed `parts`, `sections`, `ScoringBand`, `Tag` |
| 2 | Better Auth + Google + plugin admin() | Middleware chặn `/admin/*`, kèm `requireAdmin()` trong mọi Route Handler |
| 3 | Admin: media upload lên R2 | Làm trước, vì audio là nút thắt |
| 4 | Admin CRUD: material → group → question → option | Đúng thứ tự phụ thuộc |
| 5 | Nhập tay 1 bộ 10 câu hoàn chỉnh | Kiểm tra schema chịu được dữ liệu thật |
| 6 | Trang học: luyện tập + chấm điểm | |
| 7 | Từ vựng + SRS | |
| 8 | Ngữ pháp | |
| 9 | Thi thử 80 câu | Sau khi có ít nhất 2 đề đầy đủ |
| 10 | Xếp hạng | Khi đã có người dùng thật |

Bước 5 quan trọng hơn vẻ ngoài của nó. Nhập một bộ thật vào sẽ lộ ra mọi chỗ schema thiếu, và sửa lúc này rẻ hơn sửa lúc đã có 400 câu.
