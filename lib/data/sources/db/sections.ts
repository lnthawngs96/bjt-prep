import { db } from '@/lib/db';
import type { PartWithSections } from '@/lib/data/types';
import type { Part, PartDef, SectionCode, SectionDef, Tag } from '@/lib/prisma-types';

/** Cấu trúc đề — bảng seed, gần như không đổi. */

export async function getParts(): Promise<PartDef[]> {
  return db.partDef.findMany({ orderBy: { order: 'asc' } });
}

export async function getPartsWithSections(): Promise<PartWithSections[]> {
  return db.partDef.findMany({
    include: { sections: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });
}

export async function getSections(): Promise<SectionDef[]> {
  return db.sectionDef.findMany({ orderBy: [{ part: 'asc' }, { order: 'asc' }] });
}

export async function getSectionsByPart(part: Part): Promise<SectionDef[]> {
  return db.sectionDef.findMany({ where: { part }, orderBy: { order: 'asc' } });
}

export async function getSection(code: SectionCode): Promise<SectionDef | null> {
  return db.sectionDef.findUnique({ where: { code } });
}

export async function getTags(): Promise<Tag[]> {
  return db.tag.findMany({ orderBy: { order: 'asc' } });
}
