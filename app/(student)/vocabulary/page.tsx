import type { Metadata } from 'next';
import Link from 'next/link';
import { getDueVocabCount, getVocabByTopic, getVocabTopics } from '@/lib/data/vocab';
import { getSession } from '@/lib/auth-server';
import type { VocabEntry } from '@/lib/prisma-types';
import { VocabularyBrowser } from '@/components/vocabulary/VocabularyBrowser';

export const metadata: Metadata = { title: 'Từ vựng' };

export default async function VocabularyPage() {
  const session = await getSession();
  const [topics, due] = await Promise.all([
    getVocabTopics(),
    getDueVocabCount(session?.user.id ?? null),
  ]);
  const entries = await Promise.all(
    topics.map(async (t) => [t.slug, await getVocabByTopic(t.slug)] as const),
  );
  const entriesByTopic: Record<string, VocabEntry[]> = Object.fromEntries(entries);

  return (
    <div className="pt-10">
      <div className="mb-8 flex flex-wrap items-end gap-5 px-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Từ vựng</h1>
          <p className="max-w-prose text-sm text-fg2">
            Từ vựng thương mại theo chủ đề, kèm tầng lịch sự và ghi chú dùng khi nào.
          </p>
        </div>
        {due > 0 && (
          <Link
            href="/vocabulary/review"
            className="ml-auto rounded-lg bg-(image:--g) px-6 py-3 text-sm font-semibold text-on-g shadow-btn transition duration-200 hover:brightness-110"
          >
            Ôn {due} từ đến hạn
          </Link>
        )}
      </div>
      <div className="px-6">
        <VocabularyBrowser topics={topics} entriesByTopic={entriesByTopic} />
      </div>
      <div className="h-40" />
    </div>
  );
}
