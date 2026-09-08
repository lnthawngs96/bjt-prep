import type { Metadata } from 'next';
import { getPartsWithSections } from '@/lib/data/sections';
import { getSetsBySection } from '@/lib/data/attempts';
import { getSession } from '@/lib/auth-server';
import type { QuestionSetSummary } from '@/lib/data/types';
import { PracticeBrowser } from '@/components/practice/PracticeBrowser';

export const metadata: Metadata = { title: 'Luyện thi' };

export default async function PracticePage() {
  const [parts, session] = await Promise.all([getPartsWithSections(), getSession()]);
  const userId = session?.user.id ?? null;

  // Nạp sẵn mọi section ở server — 9 truy vấn nhỏ, tránh loading spinner
  // mỗi lần bấm chip. Khi nối DB thật thì gộp thành một truy vấn.
  const entries = await Promise.all(
    parts.flatMap((p) =>
      p.sections.map(async (s) => [s.code, await getSetsBySection(s.code, userId)] as const),
    ),
  );
  const setsBySection: Record<string, QuestionSetSummary[]> = Object.fromEntries(entries);

  return (
    <div className="pt-10">
      <div className="mb-8 px-6">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Luyện thi</h1>
        <p className="max-w-prose text-sm text-fg2">
          Luyện từng section theo đúng cấu trúc đề BJT. Chọn phần, chọn dạng câu, rồi làm từng bộ —
          không cần ngồi cả đề 105 phút.
        </p>
      </div>
      <PracticeBrowser parts={parts} setsBySection={setsBySection} />
      <div className="h-40" />
    </div>
  );
}
