import { describe, expect, it } from 'vitest';
import {
  buildExamParts,
  mockTimeLimitSec,
  navigationModeFor,
  practiceTimeLimitSec,
  totalTimeLimitSec,
  validateMockTestComposition,
} from '@/lib/exam-rules';
import { MOCK_PARTS, MOCK_SECTIONS } from '@/mock/sections';
import type { GroupForExam, PartWithSections } from '@/lib/data/types';
import type { SectionCode } from '@/lib/prisma-types';

const PARTS: PartWithSections[] = MOCK_PARTS.map((p) => ({
  ...p,
  sections: MOCK_SECTIONS.filter((s) => s.part === p.code).sort((a, b) => a.order - b.order),
}));

/** Group tối giản cho test: chỉ cần sectionCode và số câu. */
function group(id: string, sectionCode: SectionCode, n: number): GroupForExam {
  return {
    id,
    sectionCode,
    level: 'J2',
    titleAdmin: id,
    instructionJa: null,
    instructionVi: null,
    status: 'PUBLISHED',
    createdById: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    materials: [],
    questions: Array.from({ length: n }, (_, i) => ({
      id: `${id}-q${i + 1}`,
      groupId: id,
      order: i + 1,
      sectionCode,
      level: 'J2',
      stemJa: '',
      stemFurigana: null,
      audioStartMs: null,
      audioEndMs: null,
      options: [],
    })),
  };
}

describe('navigationModeFor', () => {
  it('MOCK: phần nghe tuyến tính, phần đọc tự do', () => {
    for (const code of ['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3'] as const) {
      expect(navigationModeFor('MOCK', code)).toBe('linear');
    }
    for (const code of ['R1', 'R2', 'R3'] as const) {
      expect(navigationModeFor('MOCK', code)).toBe('free');
    }
  });
  it('các chế độ khác luôn tự do', () => {
    expect(navigationModeFor('PRACTICE', 'L1')).toBe('free');
    expect(navigationModeFor('REVIEW', 'LR2')).toBe('free');
    expect(navigationModeFor('WEAKNESS', 'L3')).toBe('free');
  });
});

describe('buildExamParts — MOCK', () => {
  // Cố ý đưa group lộn xộn: phần đọc trước, section 3 trước section 1.
  const groups = [
    group('r2', 'R2', 2),
    group('l3', 'L3', 3),
    group('lr2-a', 'LR2', 3),
    group('l1', 'L1', 2),
    group('lr2-b', 'LR2', 4),
    group('r1', 'R1', 1),
  ];
  const parts = buildExamParts(groups, PARTS, 'MOCK', 900);

  it('ba phần đúng thứ tự 聴解 → 聴読解 → 読解', () => {
    expect(parts.map((p) => p.part)).toEqual(['LISTENING', 'LISTENING_READING', 'READING']);
    expect(parts.map((p) => p.order)).toEqual([1, 2, 3]);
  });

  it('mỗi phần mang đồng hồ riêng của PartDef, không phải thời gian luyện tập', () => {
    expect(parts.map((p) => p.timeLimitSec)).toEqual([2700, 1800, 1800]);
  });

  it('trong phần xếp theo section, cùng section giữ thứ tự ban đầu', () => {
    expect(parts[0].slots.map((s) => s.group.id)).toEqual(['l1', 'l1', 'l3', 'l3', 'l3']);
    expect(parts[1].slots.map((s) => s.group.id)).toEqual([
      'lr2-a', 'lr2-a', 'lr2-a', 'lr2-b', 'lr2-b', 'lr2-b', 'lr2-b',
    ]);
    expect(parts[2].slots.map((s) => s.group.id)).toEqual(['r1', 'r2', 'r2']);
  });

  it('phần nghe tuyến tính, phần đọc tự do', () => {
    expect(parts.map((p) => p.navigationMode)).toEqual(['linear', 'linear', 'free']);
  });

  it('bỏ phần không có group', () => {
    const only = buildExamParts([group('r1', 'R1', 1)], PARTS, 'MOCK', 900);
    expect(only).toHaveLength(1);
    expect(only[0].part).toBe('READING');
    expect(only[0].order).toBe(1);
  });

  it('không mất câu nào', () => {
    const n = parts.reduce((s, p) => s + p.slots.length, 0);
    expect(n).toBe(2 + 3 + 3 + 4 + 1 + 2);
  });
});

describe('buildExamParts — PRACTICE', () => {
  it('một phần, tự do, thời gian của bộ, giữ nguyên thứ tự group', () => {
    const groups = [group('lr2-b', 'LR2', 4), group('lr2-a', 'LR2', 3)];
    const parts = buildExamParts(groups, PARTS, 'PRACTICE', 720);
    expect(parts).toHaveLength(1);
    expect(parts[0].part).toBe('LISTENING_READING');
    expect(parts[0].navigationMode).toBe('free');
    expect(parts[0].timeLimitSec).toBe(720);
    expect(parts[0].slots.map((s) => s.group.id)[0]).toBe('lr2-b');
  });
});

describe('thời gian phía server', () => {
  it('practiceTimeLimitSec mặc định 15 phút', () => {
    expect(practiceTimeLimitSec(null)).toBe(900);
    expect(practiceTimeLimitSec(12)).toBe(720);
  });

  it('mockTimeLimitSec khớp với tổng các phần đã dựng', () => {
    const groups = [group('l2', 'L2', 2), group('r3', 'R3', 3)];
    const parts = buildExamParts(groups, PARTS, 'MOCK', 900);
    expect(totalTimeLimitSec(parts)).toBe(2700 + 1800);
    expect(mockTimeLimitSec(PARTS, ['L2', 'R3', 'R3'])).toBe(2700 + 1800);
  });
});

describe('validateMockTestComposition', () => {
  const sections = MOCK_SECTIONS.map((s) => ({ code: s.code, questionCount: s.questionCount }));

  it('đủ 80 câu đúng phân bổ thì ok', () => {
    const counts = Object.fromEntries(sections.map((s) => [s.code, s.questionCount]));
    expect(validateMockTestComposition(counts, sections).ok).toBe(true);
  });

  it('nêu rõ section thiếu hoặc thừa', () => {
    const counts = Object.fromEntries(sections.map((s) => [s.code, s.questionCount]));
    counts.L1 = 3;
    counts.R3 = 11;
    const r = validateMockTestComposition(counts, sections);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual([
      { code: 'L1', have: 3, need: 5 },
      { code: 'R3', have: 11, need: 10 },
    ]);
  });
});
