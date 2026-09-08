'use client';

import { create } from 'zustand';

/**
 * State của một phiên làm bài: chỉ những thứ đổi liên tục trong lúc làm.
 *
 * KHÔNG giữ tổng số câu hay navigationMode ở đây. Hai thứ đó đến từ server
 * qua props và không đổi trong suốt phiên — nhét vào store thì phải có bước
 * init, mà init lại kéo theo chuyện gọi setter lúc render hoặc trong effect.
 * Để ở props thì không có vòng đời nào để làm sai.
 */
interface ExamSession {
  currentIndex: number;
  /** questionId → optionId đã chọn. */
  answers: Record<string, string>;
  flagged: Record<string, true>;

  reset: () => void;
  select: (questionId: string, optionId: string) => void;
  toggleFlag: (questionId: string) => void;
  setIndex: (index: number) => void;
}

export const useExamSession = create<ExamSession>((set) => ({
  currentIndex: 0,
  answers: {},
  flagged: {},

  reset: () => set({ currentIndex: 0, answers: {}, flagged: {} }),

  select: (questionId, optionId) => set((s) => ({ answers: { ...s.answers, [questionId]: optionId } })),

  toggleFlag: (questionId) =>
    set((s) => {
      const flagged = { ...s.flagged };
      if (flagged[questionId]) delete flagged[questionId];
      else flagged[questionId] = true;
      return { flagged };
    }),

  setIndex: (index) => set({ currentIndex: index }),
}));

/**
 * BJT thật là CBT tuyến tính: phần 聴解/聴読解 không lùi lại câu trước được.
 * Chế độ tuyến tính chỉ cho tiến đúng một câu.
 */
export function canNavigate(
  navigationMode: 'linear' | 'free',
  from: number,
  to: number,
  total: number,
): boolean {
  if (to < 0 || to >= total) return false;
  if (navigationMode === 'linear') return to === from + 1;
  return true;
}
