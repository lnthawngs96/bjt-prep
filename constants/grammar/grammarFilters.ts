/** Bậc lọc ở trang ngữ pháp. J5 không có mẫu ngữ pháp riêng nên không liệt kê. */
export const GRAMMAR_LEVELS = ['J4', 'J3', 'J2', 'J1', 'J1_PLUS'] as const;

/** Sắc thái lời nói — cột `register` của bảng GrammarPoint. */
export const GRAMMAR_REGISTERS = [
  { value: 'SONKEIGO', label: '尊敬語 · Tôn kính' },
  { value: 'KENJOUGO', label: '謙譲語 · Khiêm nhường' },
  { value: 'TEINEIGO', label: '丁寧語 · Lịch sự' },
  { value: 'WRITTEN', label: 'Văn viết' },
  { value: 'PLAIN', label: 'Thường' },
] as const;
