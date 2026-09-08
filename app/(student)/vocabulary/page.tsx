import type { Metadata } from 'next';
import Link from 'next/link';
import { getDueVocabCount, getVocabByTopic, getVocabTopics } from '@/lib/data/vocab';
import type { VocabEntry } from '@/lib/prisma-types';
import { VocabBrowser } from './VocabBrowser';

export const metadata: Metadata = { title: 'Từ vựng' };

export default async function VocabularyPage() {
  const [topics, due] = await Promise.all([getVocabTopics(), getDueVocabCount()]);
  const entries = await Promise.all(
    topics.map(async (t) => [t.slug, await getVocabByTopic(t.slug)] as const),
  );
  const entriesByTopic: Record<string, VocabEntry[]> = Object.fromEntries(entries);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-10">
      <div className="mb-8 flex flex-wrap items-end gap-5">
        <h1 className="text-[32px] font-bold tracking-[-.03em]">Từ vựng</h1>
        <p className="pb-1.5 max-w-[52ch] text-[13.5px] text-fg2">
          Từ vựng thương mại theo chủ đề, kèm tầng lịch sự và ghi chú dùng khi nào.
        </p>
        {due > 0 && (
          <Link
            href="/vocabulary/review"
            className="ml-auto rounded-[9px] bg-(image:--g) px-6 py-3 text-[13.5px] font-semibold text-on-g shadow-[0_5px_20px_rgba(35,150,232,.32)] transition-[filter] duration-200 hover:brightness-110"
          >
            Ôn {due} từ đến hạn
          </Link>
        )}
      </div>
      <VocabBrowser topics={topics} entriesByTopic={entriesByTopic} />
      <div className="h-40" />
    </div>
  );
}
