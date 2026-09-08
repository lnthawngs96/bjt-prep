import { db } from '@/lib/db';
import { AdminError } from '@/lib/admin/errors';
import { validateMockTestComposition } from '@/lib/exam-rules';
import type { AdminMockTestRow, AdminSetRow } from '@/lib/data/types';
import type { SetInput } from '@/lib/validation/admin/set';
import type { MockTestInput } from '@/lib/validation/admin/mockTest';
import type { Prisma, SectionCode } from '@/lib/prisma-types';
import { logAudit } from './audit';

const PUBLISHED_COUNT = {
  group: { select: { status: true, _count: { select: { questions: { where: { status: 'PUBLISHED' as const } } } } } },
};

/* ============================================================
   BỘ LUYỆN TẬP
   ============================================================ */

export async function getAdminSets(): Promise<AdminSetRow[]> {
  const rows = await db.questionSet.findMany({
    include: { items: { include: PUBLISHED_COUNT, orderBy: { order: 'asc' } } },
    orderBy: [{ sectionCode: 'asc' }, { indexNo: 'asc' }],
  });
  return rows.map(({ items, ...s }) => ({
    ...s,
    items: items.map((i) => ({ groupId: i.groupId, order: i.order })),
    questionCount: items
      .filter((i) => i.group.status === 'PUBLISHED')
      .reduce((n, i) => n + i.group._count.questions, 0),
  }));
}

function setData(input: SetInput) {
  return {
    sectionCode: input.sectionCode,
    level: input.level,
    indexNo: input.indexNo,
    titleVi: input.titleVi,
    descVi: input.descVi,
    estMinutes: input.estMinutes,
    status: input.status,
  };
}

/** Mọi group trong bộ phải cùng section với bộ — bộ luyện tập là "luyện một section". */
async function assertSameSection(tx: Prisma.TransactionClient, sectionCode: SectionCode, groupIds: string[]) {
  if (groupIds.length === 0) return;
  const wrong = await tx.questionGroup.count({ where: { id: { in: groupIds }, sectionCode: { not: sectionCode } } });
  if (wrong > 0) {
    throw new AdminError('VALIDATION', 'Có nhóm câu khác section với bộ', {
      items: `${wrong} nhóm không thuộc section ${sectionCode}`,
    });
  }
}

async function writeSetItems(tx: Prisma.TransactionClient, setId: string, input: SetInput) {
  await tx.questionSetItem.deleteMany({ where: { setId } });
  if (input.items.length) {
    await tx.questionSetItem.createMany({
      data: input.items.map((i) => ({ setId, groupId: i.groupId, order: i.order })),
      skipDuplicates: true,
    });
  }
}

export async function createSet(input: SetInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await assertSameSection(tx, input.sectionCode, input.items.map((i) => i.groupId));
    const s = await tx.questionSet.create({ data: setData(input), select: { id: true } });
    await writeSetItems(tx, s.id, input);
    await logAudit(tx, { actorId, entity: 'QuestionSet', entityId: s.id, action: 'create', diff: input });
    return s;
  });
}

export async function updateSet(id: string, input: SetInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await assertSameSection(tx, input.sectionCode, input.items.map((i) => i.groupId));
    await tx.questionSet.update({ where: { id }, data: setData(input) });
    await writeSetItems(tx, id, input);
    await logAudit(tx, { actorId, entity: 'QuestionSet', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

/** Bộ đã có lượt làm thì P2003 → IN_USE; chuyển ARCHIVED thay vì xoá. */
export async function deleteSet(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.questionSet.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'QuestionSet', entityId: id, action: 'delete' });
  });
}

/* ============================================================
   ĐỀ THI THỬ
   ============================================================ */

export async function getAdminMockTests(): Promise<AdminMockTestRow[]> {
  const rows = await db.mockTest.findMany({
    include: { items: { include: PUBLISHED_COUNT, orderBy: { order: 'asc' } } },
    orderBy: { code: 'asc' },
  });
  return rows.map(({ items, ...t }) => {
    const perSection: Partial<Record<SectionCode, number>> = {};
    let questionCount = 0;
    for (const i of items) {
      if (i.group.status !== 'PUBLISHED') continue;
      perSection[i.sectionCode] = (perSection[i.sectionCode] ?? 0) + i.group._count.questions;
      questionCount += i.group._count.questions;
    }
    return {
      ...t,
      items: items.map((i) => ({ groupId: i.groupId, sectionCode: i.sectionCode, order: i.order })),
      perSection,
      questionCount,
    };
  });
}

/** sectionCode của item chép từ group — client gửi lên chỉ để hiển thị, server lấy lại từ DB. */
async function itemsWithSection(tx: Prisma.TransactionClient, input: MockTestInput) {
  const ids = input.items.map((i) => i.groupId);
  const groups = await tx.questionGroup.findMany({ where: { id: { in: ids } }, select: { id: true, sectionCode: true } });
  const section = new Map(groups.map((g) => [g.id, g.sectionCode]));
  return input.items.map((i) => {
    const sectionCode = section.get(i.groupId);
    if (!sectionCode) throw new AdminError('VALIDATION', 'Nhóm câu không tồn tại', { items: `Nhóm ${i.groupId} không tồn tại` });
    return { groupId: i.groupId, sectionCode, order: i.order };
  });
}

async function writeMockItems(tx: Prisma.TransactionClient, mockTestId: string, input: MockTestInput) {
  const items = await itemsWithSection(tx, input);
  await tx.mockTestItem.deleteMany({ where: { mockTestId } });
  if (items.length) {
    await tx.mockTestItem.createMany({ data: items.map((i) => ({ mockTestId, ...i })), skipDuplicates: true });
  }
}

export async function createMockTest(input: MockTestInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const t = await tx.mockTest.create({
      data: { code: input.code, titleVi: input.titleVi, descVi: input.descVi, status: 'DRAFT' },
      select: { id: true },
    });
    await writeMockItems(tx, t.id, input);
    await logAudit(tx, { actorId, entity: 'MockTest', entityId: t.id, action: 'create', diff: input });
    return t;
  });
}

/** Sửa đề đang PUBLISHED thì tự hạ về DRAFT — thành phần đã đổi, phải kiểm lại đủ 80 câu. */
export async function updateMockTest(id: string, input: MockTestInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.mockTest.update({
      where: { id },
      data: { code: input.code, titleVi: input.titleVi, descVi: input.descVi, status: 'DRAFT', publishedAt: null },
    });
    await writeMockItems(tx, id, input);
    await logAudit(tx, { actorId, entity: 'MockTest', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

export async function deleteMockTest(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.mockTest.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'MockTest', entityId: id, action: 'delete' });
  });
}

/**
 * Publish chỉ khi tổng câu theo từng section khớp SectionDef
 * (5/10/10 · 5/10/10 · 10/10/10 = 80). Trả lỗi nêu rõ thiếu section nào.
 */
export async function publishMockTest(id: string, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const [test, sections] = await Promise.all([
      tx.mockTest.findUnique({ where: { id }, include: { items: { include: PUBLISHED_COUNT } } }),
      tx.sectionDef.findMany({ orderBy: [{ part: 'asc' }, { order: 'asc' }] }),
    ]);
    if (!test) throw new AdminError('NOT_FOUND', 'Không tìm thấy đề');

    const counts: Partial<Record<SectionCode, number>> = {};
    for (const i of test.items) {
      if (i.group.status !== 'PUBLISHED') continue;
      counts[i.sectionCode] = (counts[i.sectionCode] ?? 0) + i.group._count.questions;
    }
    const check = validateMockTestComposition(counts, sections);
    if (!check.ok) {
      const detail = check.missing.map((m) => `${m.code}: ${m.have}/${m.need}`).join(' · ');
      throw new AdminError('VALIDATION', `Đề chưa đúng cấu trúc 80 câu — ${detail}`, { items: detail });
    }

    await tx.mockTest.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
    await logAudit(tx, { actorId, entity: 'MockTest', entityId: id, action: 'publish' });
    return { id };
  });
}

export async function unpublishMockTest(id: string, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.mockTest.update({ where: { id }, data: { status: 'DRAFT', publishedAt: null } });
    await logAudit(tx, { actorId, entity: 'MockTest', entityId: id, action: 'unpublish' });
    return { id };
  });
}
