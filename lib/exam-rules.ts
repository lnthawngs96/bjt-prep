import type { AttemptMode, SectionCode } from '@/lib/prisma-types';
import type { ExamPart, ExamSlot, GroupForExam, NavigationMode, PartWithSections } from '@/lib/data/types';

/**
 * Quy tắc làm bài — logic thuần, KHÔNG phải truy xuất dữ liệu.
 * Để ở đây thay vì lib/data/sources vì nó không bao giờ chạm database,
 * và vì thế cũng không cần async. Có test trong tests/exam-rules.test.ts.
 */

const LISTENING_SECTIONS = new Set<string>(['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3']);

/** Cho phép nộp trễ tối đa chừng này sau khi hết giờ — bù độ trễ mạng và đồng hồ client. */
export const SUBMIT_GRACE_SEC = 120;

/** Bộ luyện tập không ghi estMinutes thì mặc định 15 phút. */
export const DEFAULT_PRACTICE_MINUTES = 15;

/**
 * BJT thật là CBT tuyến tính: audio phát MỘT LẦN và phần 聴解/聴読解 không
 * lùi lại câu trước được. Chỉ chế độ MOCK mô phỏng điều đó — luyện tập mà
 * không nghe lại được thì rất khó học.
 */
export function navigationModeFor(mode: AttemptMode, sectionCode: SectionCode): NavigationMode {
  if (mode !== 'MOCK') return 'free';
  return LISTENING_SECTIONS.has(sectionCode) ? 'linear' : 'free';
}

/** Audio chỉ phát một lần ở chế độ thi thử. */
export function audioPlayOnce(mode: AttemptMode): boolean {
  return mode === 'MOCK';
}

export function practiceTimeLimitSec(estMinutes: number | null | undefined): number {
  return (estMinutes ?? DEFAULT_PRACTICE_MINUTES) * 60;
}

/**
 * Chia các group của một lượt làm bài thành các PHẦN của màn thi.
 *
 * MOCK: gom theo Part (聴解 → 聴読解 → 読解), trong phần xếp theo thứ tự section
 * rồi theo thứ tự group đã cho. Phần không có group nào thì bỏ — đề đang soạn
 * dở vẫn làm thử được. Mỗi phần mang đồng hồ riêng của PartDef.
 *
 * PRACTICE / REVIEW / WEAKNESS: đúng một phần, điều hướng tự do, thời gian
 * là estMinutes của bộ. Group giữ nguyên thứ tự.
 */
export function buildExamParts(
  groups: GroupForExam[],
  parts: PartWithSections[],
  mode: AttemptMode,
  practiceLimitSec: number,
): ExamPart[] {
  const toSlots = (gs: GroupForExam[]): ExamSlot[] =>
    gs.flatMap((group) => group.questions.map((question) => ({ group, question })));

  const sortedParts = [...parts].sort((a, b) => a.order - b.order);

  if (mode !== 'MOCK') {
    const first = groups[0];
    const part =
      sortedParts.find((p) => p.sections.some((s) => s.code === first?.sectionCode)) ?? sortedParts[0];
    if (!part) return [];
    return [
      {
        part: part.code,
        nameJa: part.nameJa,
        nameVi: part.nameVi,
        order: 1,
        timeLimitSec: practiceLimitSec,
        navigationMode: 'free',
        slots: toSlots(groups),
      },
    ];
  }

  const out: ExamPart[] = [];
  for (const p of sortedParts) {
    const sectionOrder = new Map(p.sections.map((s) => [s.code, s.order]));
    const own = groups
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => sectionOrder.has(g.sectionCode))
      // Sắp ổn định: theo thứ tự section trong phần, rồi theo vị trí ban đầu.
      .sort((a, b) => {
        const d = (sectionOrder.get(a.g.sectionCode) ?? 0) - (sectionOrder.get(b.g.sectionCode) ?? 0);
        return d !== 0 ? d : a.i - b.i;
      })
      .map(({ g }) => g);
    if (own.length === 0) continue;
    out.push({
      part: p.code,
      nameJa: p.nameJa,
      nameVi: p.nameVi,
      order: out.length + 1,
      timeLimitSec: p.timeLimitSec,
      navigationMode: navigationModeFor(mode, own[0].sectionCode),
      slots: toSlots(own),
    });
  }
  return out;
}

/** Tổng thời gian của cả lượt — dùng ở server để chặn nộp trễ. */
export function totalTimeLimitSec(parts: ExamPart[]): number {
  return parts.reduce((n, p) => n + p.timeLimitSec, 0);
}

/**
 * Bản dành cho server: không cần dựng ExamPart, chỉ cần biết đề có section nào.
 * Phải cho cùng kết quả với totalTimeLimitSec(buildExamParts(...)) — có test.
 */
export function mockTimeLimitSec(parts: PartWithSections[], sectionCodes: SectionCode[]): number {
  const present = new Set<string>(sectionCodes);
  return parts
    .filter((p) => p.sections.some((s) => present.has(s.code)))
    .reduce((n, p) => n + p.timeLimitSec, 0);
}

/**
 * Đề thi thử hợp lệ phải khớp đủ số câu từng section (5/10/10 · 5/10/10 · 10/10/10 = 80).
 * Dùng để khoá nút publish ở admin và nêu rõ thiếu section nào.
 */
export function validateMockTestComposition(
  counts: Partial<Record<SectionCode, number>>,
  sections: { code: SectionCode; questionCount: number }[],
): { ok: boolean; missing: { code: SectionCode; have: number; need: number }[] } {
  const missing = sections
    .map((s) => ({ code: s.code, have: counts[s.code] ?? 0, need: s.questionCount }))
    .filter((x) => x.have !== x.need);
  return { ok: missing.length === 0, missing };
}
