import { MOCK_PARTS, MOCK_SECTIONS } from '@/mock/sections';
import { MOCK_TAGS } from '@/mock/tags';
import type { PartWithSections } from '@/lib/data/types';
import type { Part, PartDef, SectionCode, SectionDef, Tag } from '@/lib/prisma-types';

export async function getParts(): Promise<PartDef[]> {
  // TODO(db): return db.partDef.findMany({ orderBy: { order: 'asc' } })
  return [...MOCK_PARTS].sort((a, b) => a.order - b.order);
}

export async function getPartsWithSections(): Promise<PartWithSections[]> {
  // TODO(db): return db.partDef.findMany({ include: { sections: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } })
  return [...MOCK_PARTS]
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      ...p,
      sections: MOCK_SECTIONS.filter((s) => s.part === p.code).sort((a, b) => a.order - b.order),
    }));
}

export async function getSections(): Promise<SectionDef[]> {
  // TODO(db): return db.sectionDef.findMany({ orderBy: [{ part: 'asc' }, { order: 'asc' }] })
  return [...MOCK_SECTIONS];
}

export async function getSectionsByPart(part: Part): Promise<SectionDef[]> {
  // TODO(db): return db.sectionDef.findMany({ where: { part }, orderBy: { order: 'asc' } })
  return MOCK_SECTIONS.filter((s) => s.part === part).sort((a, b) => a.order - b.order);
}

export async function getSection(code: SectionCode): Promise<SectionDef | null> {
  // TODO(db): return db.sectionDef.findUnique({ where: { code } })
  return MOCK_SECTIONS.find((s) => s.code === code) ?? null;
}

export async function getTags(): Promise<Tag[]> {
  // TODO(db): return db.tag.findMany({ orderBy: { order: 'asc' } })
  return [...MOCK_TAGS];
}
