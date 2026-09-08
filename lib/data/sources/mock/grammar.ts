import { MOCK_GRAMMAR, MOCK_GRAMMAR_BY_SLUG, MOCK_GRAMMAR_EXAMPLES } from '@/mock/grammar';
import type { GrammarWithExamples } from '@/lib/data/types';
import type { GrammarPoint, Level, Register } from '@/lib/prisma-types';

export async function getGrammarPoints(filter?: {
  level?: Level;
  register?: Register;
}): Promise<GrammarPoint[]> {
  // TODO(db): db.grammarPoint.findMany({ where: { status: 'PUBLISHED', ...filter }, orderBy: { level: 'asc' } })
  return MOCK_GRAMMAR.filter(
    (g) =>
      (!filter?.level || g.level === filter.level) &&
      (!filter?.register || g.register === filter.register),
  );
}

export async function getGrammarBySlug(slug: string): Promise<GrammarWithExamples | null> {
  // TODO(db): db.grammarPoint.findUnique({ where: { slug }, include: { examples: { orderBy: { order: 'asc' } } } })
  const g = MOCK_GRAMMAR_BY_SLUG.get(slug);
  if (!g) return null;
  return {
    ...g,
    examples: MOCK_GRAMMAR_EXAMPLES.filter((e) => e.grammarId === g.id).sort((a, b) => a.order - b.order),
  };
}

export async function getAllGrammarForAdmin(): Promise<GrammarWithExamples[]> {
  // TODO(db): db.grammarPoint.findMany({ include: { examples: true }, orderBy: { updatedAt: 'desc' } })
  return MOCK_GRAMMAR.map((g) => ({
    ...g,
    examples: MOCK_GRAMMAR_EXAMPLES.filter((e) => e.grammarId === g.id),
  }));
}
