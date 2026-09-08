import { db } from '@/lib/db';
import { Prisma } from '@/lib/prisma-server';
import type { AdminMaterialRow, AdminMediaRow } from '@/lib/data/types';
import type { MaterialInput } from '@/lib/validation/admin/material';
import type { MediaInput } from '@/lib/validation/admin/media';
import { logAudit } from './audit';

/* ============================================================
   MATERIAL
   ============================================================ */

export async function getAdminMaterials(): Promise<AdminMaterialRow[]> {
  const rows = await db.material.findMany({
    include: { media: true, _count: { select: { groups: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(({ _count, ...m }) => ({ ...m, groupCount: _count.groups }));
}

/** Đổi input theo kind thành dữ liệu cột: cột không dùng đặt về null/DbNull. */
function materialData(input: MaterialInput) {
  const common = { kind: input.kind, titleAdmin: input.titleAdmin, status: input.status, altText: input.altText };
  switch (input.kind) {
    case 'AUDIO':
      return {
        ...common,
        mediaId: input.mediaId,
        transcript: input.transcript as Prisma.InputJsonValue,
        body: Prisma.DbNull,
      };
    case 'IMAGE':
      return { ...common, mediaId: input.mediaId, transcript: Prisma.DbNull, body: Prisma.DbNull };
    default:
      return {
        ...common,
        mediaId: null,
        transcript: Prisma.DbNull,
        body: input.body as Prisma.InputJsonValue,
      };
  }
}

export async function createMaterial(input: MaterialInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const m = await tx.material.create({ data: materialData(input), select: { id: true } });
    await logAudit(tx, { actorId, entity: 'Material', entityId: m.id, action: 'create', diff: input });
    return m;
  });
}

export async function updateMaterial(id: string, input: MaterialInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.material.update({ where: { id }, data: materialData(input) });
    await logAudit(tx, { actorId, entity: 'Material', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

/** Đang gắn vào group thì P2003 → IN_USE. */
export async function deleteMaterial(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.material.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'Material', entityId: id, action: 'delete' });
  });
}

/* ============================================================
   MEDIA — file tĩnh trong public/, đăng ký đường dẫn. TODO(r2)
   ============================================================ */

export async function getAdminMedia(): Promise<AdminMediaRow[]> {
  const rows = await db.mediaAsset.findMany({
    include: { _count: { select: { materials: true, vocabEntries: true, vocabExamples: true, grammarExamples: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(({ _count, ...m }) => ({
    ...m,
    usageCount: _count.materials + _count.vocabEntries + _count.vocabExamples + _count.grammarExamples,
  }));
}

function mediaData(input: MediaInput, actorId: string) {
  return {
    r2Key: input.r2Key,
    mime: input.mime,
    bytes: input.bytes,
    durationMs: input.durationMs,
    waveform: input.waveform === null ? Prisma.DbNull : (input.waveform as Prisma.InputJsonValue),
    uploadedBy: actorId,
  };
}

export async function createMedia(input: MediaInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const m = await tx.mediaAsset.create({ data: mediaData(input, actorId), select: { id: true } });
    await logAudit(tx, { actorId, entity: 'MediaAsset', entityId: m.id, action: 'create', diff: input });
    return m;
  });
}

export async function updateMedia(id: string, input: MediaInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.mediaAsset.update({ where: { id }, data: mediaData(input, actorId) });
    await logAudit(tx, { actorId, entity: 'MediaAsset', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

export async function deleteMedia(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.mediaAsset.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'MediaAsset', entityId: id, action: 'delete' });
  });
}
