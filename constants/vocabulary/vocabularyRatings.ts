/** Bốn mức đánh giá của FSRS. Nhãn theo thói quen người học, không dịch máy móc. */
export const VOCABULARY_RATINGS = [
  { value: 1, label: 'Quên rồi', hint: 'Gặp lại ngay', tone: 'ng' },
  { value: 2, label: 'Khó', hint: 'Vài phút nữa', tone: 'wr' },
  { value: 3, label: 'Nhớ được', hint: 'Vài ngày', tone: 'ok' },
  { value: 4, label: 'Quá dễ', hint: 'Vài tuần', tone: 'acc' },
] as const;

/** Nhãn hiển thị cho cột `kind` của bảng VocabRelation. */
export const VOCABULARY_RELATION_LABELS: Record<string, string> = {
  sonkeigo: '尊敬語',
  kenjougo: '謙譲語',
  teineigo: '丁寧語',
  synonym: 'Đồng nghĩa',
  antonym: 'Trái nghĩa',
};
