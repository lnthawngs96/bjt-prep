'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SourceRef } from '@/components/common/SourceRef';
import type { VocabTopicWithCount } from '@/lib/data/types';
import type { VocabEntry } from '@/lib/prisma-types';

const REGISTER_LABEL: Record<string, string> = {
  SONKEIGO: '尊敬語',
  KENJOUGO: '謙譲語',
  TEINEIGO: '丁寧語',
  PLAIN: 'Thường',
  WRITTEN: 'Văn viết',
};

export function VocabularyBrowser({
  topics,
  entriesByTopic,
}: {
  topics: VocabTopicWithCount[];
  entriesByTopic: Record<string, VocabEntry[]>;
}) {
  const [slug, setSlug] = useState(topics[0]?.slug ?? '');
  const entries = entriesByTopic[slug] ?? [];
  const topic = topics.find((t) => t.slug === slug);

  return (
    <>
      <div className="flex flex-wrap gap-2 pb-8">
        {topics.map((t) => (
          <Chip key={t.id} pressed={t.slug === slug} onClick={() => setSlug(t.slug)}>
            {t.nameVi}
            <span className="ml-1.5 tabular-nums opacity-70">{t.entryCount}</span>
          </Chip>
        ))}
      </div>

      {topic && (
        <SectionHeading
          title={topic.nameVi}
          meta={
            <>
              {topic.nameJa && <span className="jp">{topic.nameJa}</span>}
              {topic.nameJa ? ' · ' : ''}
              {entries.length} từ
            </>
          }
        />
      )}

      <ul className="flex flex-col gap-1">
        {entries.map((v) => (
          <li key={v.id} className="-mx-6 rounded-lg px-6 py-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="jp text-xl font-bold">{v.headword}</span>
              <span className="jp text-sm text-fg2">{v.readingKana}</span>
              <span className="text-xs text-fg3">{v.meaningVi}</span>
              <span className="ml-auto flex flex-none items-center gap-2">
                {v.register && <Badge tone="neutral">{REGISTER_LABEL[v.register] ?? v.register}</Badge>}
                <Badge tone="gradient">{v.level.replace('_PLUS', '+')}</Badge>
              </span>
            </div>
            {v.noteVi && <p className="mt-2 max-w-prose text-xs text-fg2">{v.noteVi}</p>}
            <SourceRef className="mt-2" sourceKey={v.sourceKey} sourceLocator={v.sourceLocator} />
          </li>
        ))}
      </ul>
    </>
  );
}
