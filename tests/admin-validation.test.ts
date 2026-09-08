import { describe, expect, it } from 'vitest';
import { questionInputSchema } from '@/lib/validation/admin/question';
import { materialInputSchema } from '@/lib/validation/admin/material';
import { mediaInputSchema } from '@/lib/validation/admin/media';
import { grammarInputSchema } from '@/lib/validation/admin/grammar';
import { mockTestInputSchema } from '@/lib/validation/admin/mockTest';

const options = (correct: number) =>
  [1, 2, 3, 4].map((order) => ({ order, textJa: `選択肢${order}`, isCorrect: order === correct, distractorNote: null }));

const question = {
  groupId: 'g1',
  order: 1,
  level: 'J3',
  stemJa: '問題',
  stemVi: '',
  audioStartMs: '',
  audioEndMs: null,
  explanationVi: 'vì',
  status: 'DRAFT',
  options: options(2),
};

describe('questionInputSchema', () => {
  it('chuẩn hoá: chuỗi rỗng thành null, mảng liên kết mặc định rỗng', () => {
    const r = questionInputSchema.parse(question);
    expect(r.stemVi).toBeNull();
    expect(r.audioStartMs).toBeNull();
    expect(r.tagIds).toEqual([]);
    expect(r.vocabLinks).toEqual([]);
  });

  it('phải có đúng một đáp án đúng', () => {
    const none = questionInputSchema.safeParse({ ...question, options: options(0) });
    expect(none.success).toBe(false);
    const two = questionInputSchema.safeParse({ ...question, options: options(1).map((o) => ({ ...o, isCorrect: o.order <= 2 })) });
    expect(two.success).toBe(false);
    if (!two.success) expect(two.error.issues.some((i) => i.path.join('.') === 'options')).toBe(true);
  });

  it('đúng 4 phương án, thứ tự 1..4', () => {
    expect(questionInputSchema.safeParse({ ...question, options: options(1).slice(0, 3) }).success).toBe(false);
    const dup = options(1);
    dup[3].order = 1;
    expect(questionInputSchema.safeParse({ ...question, options: dup }).success).toBe(false);
  });

  it('audio kết thúc không được trước bắt đầu', () => {
    const r = questionInputSchema.safeParse({ ...question, audioStartMs: 5000, audioEndMs: 1000 });
    expect(r.success).toBe(false);
  });

  it('textJa trống được chấp nhận ở tầng zod (section kiểm ở server)', () => {
    const r = questionInputSchema.safeParse({ ...question, options: options(1).map((o) => ({ ...o, textJa: '' })) });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.options.every((o) => o.textJa === null)).toBe(true);
  });
});

describe('materialInputSchema', () => {
  it('rẽ nhánh theo kind', () => {
    expect(materialInputSchema.safeParse({ kind: 'AUDIO', titleAdmin: 'a', status: 'DRAFT', mediaId: 'm' }).success).toBe(true);
    expect(materialInputSchema.safeParse({ kind: 'AUDIO', titleAdmin: 'a', status: 'DRAFT' }).success).toBe(false);
    expect(
      materialInputSchema.safeParse({ kind: 'DOCUMENT', titleAdmin: 'a', status: 'DRAFT', body: { format: 'html', content: 'x' } }).success,
    ).toBe(false);
    expect(
      materialInputSchema.safeParse({ kind: 'TABLE', titleAdmin: 'a', status: 'DRAFT', body: { headers: ['x'], rows: [['1']] } }).success,
    ).toBe(true);
  });
});

describe('mediaInputSchema', () => {
  it('r2Key là đường dẫn tương đối trong public/, không .. không /', () => {
    expect(mediaInputSchema.safeParse({ r2Key: 'mock-audio/a.wav', mime: 'audio/wav', bytes: 1 }).success).toBe(true);
    expect(mediaInputSchema.safeParse({ r2Key: '/etc/passwd', mime: 'x', bytes: 1 }).success).toBe(false);
    expect(mediaInputSchema.safeParse({ r2Key: '../x', mime: 'x', bytes: 1 }).success).toBe(false);
  });
});

describe('grammar và mock test', () => {
  it('slug chỉ chữ thường, số, gạch ngang', () => {
    const base = { pattern: 'x', formation: 'x', meaningVi: 'x', register: 'PLAIN', level: 'J3', status: 'DRAFT' };
    expect(grammarInputSchema.safeParse({ ...base, slug: 'sasete-itadaku' }).success).toBe(true);
    expect(grammarInputSchema.safeParse({ ...base, slug: 'Sasete Itadaku' }).success).toBe(false);
  });
  it('mã đề in hoa', () => {
    expect(mockTestInputSchema.safeParse({ code: 'MT-04', titleVi: 'x' }).success).toBe(true);
    expect(mockTestInputSchema.safeParse({ code: 'mt-04', titleVi: 'x' }).success).toBe(false);
  });
});
