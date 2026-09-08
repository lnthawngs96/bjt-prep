import { db } from '@/lib/db';
import type { GrammarWithExamples } from '@/lib/data/types';
import type { GrammarPoint, Level, Register } from '@/lib/prisma-types';

export async function getGrammarPoints(filter?: {
  level?: Level;
  register?: Register;
}): Promise<GrammarPoint[]> {
  return db.grammarPoint.findMany({
    where: { status: 'PUBLISHED', level: filter?.level, register: filter?.register },
    orderBy: [{ level: 'asc' }, { pattern: 'asc' }],
  });
}

export async function getGrammarBySlug(slug: string): Promise<GrammarWithExamples | null> {
  return db.grammarPoint.findUnique({
    where: { slug },
    include: { examples: { orderBy: { order: 'asc' } } },
  });
}

export async function getAllGrammarForAdmin(): Promise<GrammarWithExamples[]> {
  return db.grammarPoint.findMany({
    include: { examples: { orderBy: { order: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
}
