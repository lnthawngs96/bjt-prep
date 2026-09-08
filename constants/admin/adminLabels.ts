import type { ContentStatus, Level, MaterialKind, Part, PartOfSpeech, Register, SectionCode, UserRole } from '@/lib/prisma-types';

/** Nhãn và tông màu cho trạng thái nội dung — ánh xạ theo prototype (g/w/r/n). */
export const ADMIN_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'Đang soạn',
  NEEDS_AUDIO: 'Chờ audio',
  NEEDS_REVIEW: 'Chờ duyệt',
  PUBLISHED: 'Đã duyệt',
  FLAGGED: 'Bị báo lỗi',
  ARCHIVED: 'Lưu trữ',
};

export const ADMIN_STATUS_TONES: Record<ContentStatus, 'ok' | 'ng' | 'wr' | 'neutral'> = {
  DRAFT: 'neutral',
  NEEDS_AUDIO: 'wr',
  NEEDS_REVIEW: 'wr',
  PUBLISHED: 'ok',
  FLAGGED: 'ng',
  ARCHIVED: 'neutral',
};

/** Thứ tự hiện trạng thái trong thanh pipeline và bộ lọc. */
export const ADMIN_STATUS_ORDER: ContentStatus[] = [
  'PUBLISHED',
  'DRAFT',
  'NEEDS_AUDIO',
  'NEEDS_REVIEW',
  'FLAGGED',
  'ARCHIVED',
];

export const ADMIN_LEVELS: Level[] = ['J5', 'J4', 'J3', 'J2', 'J1', 'J1_PLUS'];
export const levelLabel = (l: Level) => l.replace('_PLUS', '+');

export const ADMIN_PART_LABELS: Record<Part, string> = {
  LISTENING: '聴解',
  LISTENING_READING: '聴読解',
  READING: '読解',
};

export const ADMIN_SECTION_SHORT: Record<SectionCode, string> = {
  L1: '聴解 S1',
  L2: '聴解 S2',
  L3: '聴解 S3',
  LR1: '聴読解 S1',
  LR2: '聴読解 S2',
  LR3: '聴読解 S3',
  R1: '読解 S1',
  R2: '読解 S2',
  R3: '読解 S3',
};

export const ADMIN_KIND_LABELS: Record<MaterialKind, string> = {
  AUDIO: 'Audio',
  DOCUMENT: 'Văn bản',
  IMAGE: 'Ảnh',
  TABLE: 'Bảng số liệu',
  CHART: 'Biểu đồ',
};

export const ADMIN_REGISTER_LABELS: Record<Register, string> = {
  SONKEIGO: '尊敬語 · tôn kính',
  KENJOUGO: '謙譲語 · khiêm nhường',
  TEINEIGO: '丁寧語 · lịch sự',
  PLAIN: 'Thể thường',
  WRITTEN: 'Văn viết',
};

export const ADMIN_POS_LABELS: Record<PartOfSpeech, string> = {
  NOUN: 'Danh từ',
  VERB_U: 'Động từ nhóm 1 (u)',
  VERB_RU: 'Động từ nhóm 2 (ru)',
  VERB_IRR: 'Động từ bất quy tắc',
  I_ADJ: 'Tính từ い',
  NA_ADJ: 'Tính từ な',
  ADVERB: 'Phó từ',
  EXPRESSION: 'Cụm cố định',
  COUNTER: 'Lượng từ',
};

export const ADMIN_ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Học viên',
  EDITOR: 'Biên tập',
  ADMIN: 'Quản trị',
};

export const ADMIN_RELATION_LABELS: Record<string, string> = {
  synonym: 'Đồng nghĩa',
  antonym: 'Trái nghĩa',
  sonkeigo: '尊敬語 của',
  kenjougo: '謙譲語 của',
  teineigo: '丁寧語 của',
};

/** Ở ba section này phương án được đọc trong audio, textJa được để trống. */
export const ADMIN_SPOKEN_OPTION_SECTIONS: SectionCode[] = ['L1', 'L2', 'LR1'];
