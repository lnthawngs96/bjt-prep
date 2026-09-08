import type {
  Attempt,
  AttemptAnswer,
  GrammarExample,
  GrammarPoint,
  Material,
  MediaAsset,
  Question,
  QuestionGroup,
  QuestionOption,
  QuestionSet,
  MockTest,
  SectionDef,
  PartDef,
  Tag,
  VocabEntry,
  VocabExample,
  VocabTopic,
} from '@/lib/prisma-types';

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
  perSection: Partial<Record<SectionDef['code'], number>>;
  lastAttempt: { attemptId: string; score: number; correct: number; takenAt: Date } | null;
};

/* ============================================================
   LƯỢT LÀM BÀI
   ============================================================ */

/** Điều hướng trong màn làm bài — xem mục cùng tên trong CLAUDE.md. */
export type NavigationMode = 'linear' | 'free';

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
  estimatedScore: number;
  estimatedLevel: Attempt['estimatedLevel'];
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
