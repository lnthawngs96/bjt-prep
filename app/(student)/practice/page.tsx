import type { Metadata } from 'next';
import { getPartsWithSections } from '@/lib/data/sections';
import { getSetsBySection } from '@/lib/data/attempts';
import type { QuestionSetSummary } from '@/lib/data/types';
import { PracticeBrowser } from './PracticeBrowser';

export const metadata: Metadata = { title: 'Luyện thi' };

export default async function PracticePage() {
  const parts = await getPartsWithSections();

  // Nạp sẵn mọi section ở server — 9 truy vấn nhỏ, tránh loading spinner
  // mỗi lần bấm chip. Khi nối DB thật thì gộp thành một truy vấn.
  const entries = await Promise.all(
    parts.flatMap((p) =>
      p.sections.map(async (s) => [s.code, await getSetsBySection(s.code)] as const),
    ),
  );
  const setsBySection: Record<string, QuestionSetSummary[]> = Object.fromEntries(entries);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8">
      <PracticeBrowser parts={parts} setsBySection={setsBySection} />
      <div className="h-40" />
    </div>
  );
}
