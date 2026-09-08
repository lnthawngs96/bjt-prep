import type {
  Attempt,
  AttemptAnswer,
  ContentStatus,
  GrammarExample,
  GrammarPoint,
  Level,
  Material,
  MediaAsset,
  Part,
  Question,
  QuestionGroup,
  QuestionOption,
  QuestionReport,
  QuestionSet,
  MockTest,
  SectionCode,
  SectionDef,
  PartDef,
  Tag,
  User,
  VocabEntry,
  VocabExample,
  VocabTopic,
} from '@/lib/prisma-types';
import type { scoreAttempt } from '@/lib/scoring';

/* ============================================================
   HAI KIỂU CÂU HỎI — ranh giới bảo mật của cả sản phẩm
   ============================================================ */

/**
 * Gửi xuống client TRONG lúc làm bài.
 *
 * Dùng `Pick` chứ KHÔNG dùng `Omit`. Lý do quan trọng: `Omit` fails open —
 * mai kia thêm một cột nhạy cảm vào schema thì nó tự động lọt xuống client
 * mà không ai hay. `Pick` fails closed: cột mới mặc định không có ở đây,
 * muốn thêm phải sửa file này một cách có ý thức.
 *
 * KHÔNG có: isCorrect · distractorNote · explanationVi · businessNoteVi ·
 * stemVi (bản dịch, schema ghi rõ chỉ hiện ở màn xem lại) ·
 * correctRate / discrimination / attemptCount (số liệu soát nội dung nội bộ).
 */
export type QuestionForExam = Pick<
  Question,
  'id' | 'groupId' | 'order' | 'sectionCode' | 'level' | 'stemJa' | 'stemFurigana' | 'audioStartMs' | 'audioEndMs'
> & {
  options: Pick<QuestionOption, 'id' | 'order' | 'textJa'>[];
};

/** Chỉ trả SAU khi nộp bài. Đây là kiểu đầy đủ, có đáp án và giải thích. */
export type QuestionWithAnswer = Question & {
  options: QuestionOption[];
};

/* ============================================================
   GROUP (大問) — đơn vị dữ liệu trung tâm
   ============================================================ */

export type MaterialWithMedia = Material & { media: MediaAsset | null };

/** Group cho màn thi: tài liệu đầy đủ, câu hỏi đã lọc sạch đáp án. */
export type GroupForExam = QuestionGroup & {
  materials: MaterialWithMedia[];
  questions: QuestionForExam[];
};

/** Group cho màn xem lại: đầy đủ mọi thứ. */
export type GroupWithAnswers = QuestionGroup & {
  materials: MaterialWithMedia[];
  questions: QuestionWithAnswer[];
};

/* ============================================================
   CẤU TRÚC ĐỀ
   ============================================================ */

export type PartWithSections = PartDef & { sections: SectionDef[] };

/* ============================================================
   BỘ LUYỆN TẬP VÀ ĐỀ THI THỬ
   ============================================================ */

export type QuestionSetSummary = QuestionSet & {
  /** Tổng số câu trong bộ, cộng từ các group. */
  questionCount: number;
  /** Kết quả lần làm gần nhất của người dùng hiện tại, null nếu chưa làm. */
  lastResult: { correct: number; total: number; attemptId: string } | null;
};

export type MockTestSummary = MockTest & {
  questionCount: number;
  /** Số câu theo từng section — dùng để cảnh báo đề chưa đủ 80 câu. */
  perSection: Partial<Record<SectionCode, number>>;
  lastAttempt: { attemptId: string; score: number; correct: number; takenAt: Date } | null;
};

/* ============================================================
   LƯỢT LÀM BÀI
   ============================================================ */

/** Điều hướng trong màn làm bài — xem mục cùng tên trong CLAUDE.md. */
export type NavigationMode = 'linear' | 'free';

/** Một câu trên màn thi, kèm group chứa tài liệu của nó. */
export type ExamSlot = { group: GroupForExam; question: QuestionForExam };

/**
 * Một PHẦN của màn thi. BJT thật có ba phần với ba đồng hồ riêng; phần nghe
 * tuyến tính, phần đọc tự do trong phần, không quay lại phần đã xong.
 * Luyện tập chỉ có một phần.
 */
export type ExamPart = {
  part: Part;
  nameJa: string;
  nameVi: string;
  order: number;
  timeLimitSec: number;
  navigationMode: NavigationMode;
  slots: ExamSlot[];
};

export type SubmitError = 'NOT_FOUND' | 'ALREADY_SUBMITTED' | 'TIME_EXCEEDED';
export type SubmitResult = { attemptId: string } & ReturnType<typeof scoreAttempt>;

export type AttemptWithAnswers = Attempt & { answers: AttemptAnswer[] };

/** Một câu trên màn kết quả: câu hỏi đầy đủ + người dùng đã chọn gì. */
export type ResultItem = {
  question: QuestionWithAnswer;
  group: Pick<QuestionGroup, 'id' | 'titleAdmin' | 'sectionCode' | 'instructionVi'>;
  materials: MaterialWithMedia[];
  selectedOptionId: string | null;
  isCorrect: boolean;
  /** Từ và ngữ pháp nên ôn vì câu này. */
  vocabToReview: VocabEntry[];
  grammarToReview: GrammarPoint[];
  tags: Tag[];
};

export type AttemptResult = {
  attempt: Attempt;
  items: ResultItem[];
  /** Chỉ có giá trị khi mode = MOCK và đề đủ 80 câu. */
  estimatedScore: number | null;
  estimatedLevel: Attempt['estimatedLevel'];
};

/* ============================================================
   TỪ VỰNG VÀ NGỮ PHÁP
   ============================================================ */

export type VocabWithExamples = VocabEntry & {
  examples: VocabExample[];
  /** 言う → おっしゃる (sonkeigo) / 申す (kenjougo) */
  related: { relation: string; entry: VocabEntry }[];
};

export type VocabTopicWithCount = VocabTopic & { entryCount: number };

export type GrammarWithExamples = GrammarPoint & { examples: GrammarExample[] };

/* ============================================================
   QUẢN TRỊ — hình dạng dữ liệu cho các trang /admin
   ============================================================ */

export type AdminOverview = {
  questionsByStatus: Partial<Record<ContentStatus, number>>;
  counts: {
    groups: number;
    materials: number;
    media: number;
    vocab: number;
    grammar: number;
    sets: number;
    mockTests: number;
    users: number;
    attempts: number;
    openReports: number;
  };
};

/** Danh sách câu hỏi — nhẹ, đủ để lọc và tìm; sửa thì tải bản đầy đủ. */
export type AdminQuestionRow = Pick<
  Question,
  'id' | 'stemJa' | 'sectionCode' | 'level' | 'status' | 'groupId' | 'order' | 'updatedAt'
> & {
  groupTitle: string;
  optionCount: number;
  spokenOptions: boolean;
};

export type AdminQuestionEditor = Question & {
  options: QuestionOption[];
  tagIds: string[];
  vocabLinks: { vocabId: string; relevance: string }[];
  grammarLinks: { grammarId: string; relevance: string }[];
};

export type AdminGroupRow = QuestionGroup & {
  materials: { materialId: string; order: number; titleAdmin: string; kind: Material['kind'] }[];
  questionCount: number;
};

export type AdminMaterialRow = Material & { media: MediaAsset | null; groupCount: number };

export type AdminMediaRow = MediaAsset & { usageCount: number };

export type AdminVocabRow = VocabEntry & {
  examples: VocabExample[];
  relations: { relatedId: string; relation: string; headword: string }[];
};

export type AdminGrammarRow = GrammarPoint & { examples: GrammarExample[] };

export type AdminSetRow = QuestionSet & {
  items: { groupId: string; order: number }[];
  questionCount: number;
};

export type AdminMockTestRow = MockTest & {
  items: { groupId: string; sectionCode: SectionCode; order: number }[];
  perSection: Partial<Record<SectionCode, number>>;
  questionCount: number;
};

export type AdminUserRow = Pick<User, 'id' | 'name' | 'email' | 'role' | 'banned' | 'createdAt'> & {
  attemptCount: number;
};

export type AdminQuestionStat = {
  questionId: string;
  stemJa: string;
  sectionCode: SectionCode;
  attempts: number;
  correct: number;
  rate: number;
  /** Tỉ lệ đúng < 10% hoặc > 95% với đủ lượt làm — nhiều khả năng đáp án nhập sai hoặc câu quá dễ. */
  suspicious: boolean;
};

export type AdminReportRow = QuestionReport & {
  question: Pick<Question, 'id' | 'stemJa' | 'sectionCode'>;
  user: Pick<User, 'email' | 'name'> | null;
};

/** Danh sách chọn cho các form — tải một lần ở server component. */
export type AdminLookups = {
  parts: PartDef[];
  sections: SectionDef[];
  groups: (Pick<QuestionGroup, 'id' | 'titleAdmin' | 'sectionCode' | 'level' | 'status'> & {
    /** Số câu PUBLISHED — để form đề thi thử đếm 80 câu ngay khi lắp. */
    questionCount: number;
  })[];
  materials: Pick<Material, 'id' | 'titleAdmin' | 'kind'>[];
  media: Pick<MediaAsset, 'id' | 'r2Key' | 'mime'>[];
  tags: Tag[];
  vocab: Pick<VocabEntry, 'id' | 'headword' | 'readingKana'>[];
  grammar: Pick<GrammarPoint, 'id' | 'pattern' | 'slug'>[];
  topics: VocabTopic[];
};

/* ============================================================
   HỌC VIÊN
   ============================================================ */

export type WeakSkill = {
  /** 'section' hoặc 'tag' */
  dimension: 'section' | 'tag';
  key: string;
  labelVi: string;
  attempts: number;
  correct: number;
  accuracy: number;
};

export type StudentDashboard = {
  displayName: string;
  /** null khi chưa làm đề thi thử nào — trang chủ hiện lời mời thay vì thước điểm. */
  estimatedScore: number | null;
  estimatedLevel: Level | null;
  daysToExam: number | null;
  /** Khối "Tiếp tục ở đây". */
  continueHere: {
    sectionCode: SectionDef['code'];
    /** Tên PHẦN (聴読解) — chữ gradient cỡ lớn ở hero. */
    partNameJa: string;
    /** Tên section (資料聴読解問題) — dùng ở dòng phụ và trang luyện tập. */
    sectionNameJa: string;
    /** Thứ tự section trong phần: 1, 2 hoặc 3. */
    sectionOrder: number;
    setId: string;
    setTitleVi: string;
    indexNo: number;
    accuracy: number;
    sectionScore: number;
    sectionMaxScore: number;
    questionCount: number;
    level: QuestionSet['level'];
    reasonVi: string;
  } | null;
  todayTasks: { id: string; titleVi: string; subtitleVi: string; meta: string; href: string }[];
  weakSkills: WeakSkill[];
  /** 7 phần tử, thứ Hai → Chủ nhật. */
  weeklyActivity: {
    label: string;
    /** Số câu thật trong ngày. */
    questions: number;
    /** Chiều cao cột tính theo % của ngày cao nhất trong tuần. */
    heightPct: number;
    isToday: boolean;
  }[];
  /** Tổng số câu trong tuần — cộng từ weeklyActivity. */
  weeklyTotal: number;
};
