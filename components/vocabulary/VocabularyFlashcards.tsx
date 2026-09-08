'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  VOCABULARY_RATINGS,
  VOCABULARY_RELATION_LABELS,
} from '@/constants/vocabulary/vocabularyRatings';
import type { VocabWithExamples } from '@/lib/data/types';

export function VocabularyFlashcards({ cards }: { cards: VocabWithExamples[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const card = cards[index];

  function rate(_rating: 1 | 2 | 3 | 4) {
    // TODO(db): gọi recordVocabReview qua Route Handler, tính lịch bằng ts-fsrs
    // rồi cập nhật SrsCard và chèn SrsReview.
    setDone((n) => n + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (!card) {
    return (
      <div className="py-24 text-center">
        <p className="gt mb-3 text-4xl font-bold tabular-nums">{done}</p>
        <p className="mb-8 text-base text-fg2">
          Xong phiên ôn hôm nay. Lịch ôn tiếp theo do FSRS quyết định.
        </p>
        <Link
          href="/vocabulary"
          className="rounded-lg border border-ln px-6 py-3 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
        >
          Về danh sách từ vựng
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3 text-xs text-fg3">
        <span className="tabular-nums">
          {index + 1} / {cards.length}
        </span>
        <span className="h-1 flex-1 overflow-hidden rounded-sm bg-ln">
          <span
            style={{ width: `${(index / cards.length) * 100}%` }}
            className="block h-full bg-(image:--g) transition-all duration-300"
          />
        </span>
      </div>

      <div className="min-h-80 border-y border-ln py-12 text-center">
        <p className="jp mb-3 text-5xl font-bold leading-tight">{card.headword}</p>

        {revealed ? (
          <>
            <p className="jp mb-6 text-lg text-fg2">{card.readingKana}</p>
            <p className="mb-2 text-xl font-medium">{card.meaningVi}</p>
            <div className="mb-6 flex justify-center gap-2">
              {card.register && <Badge tone="neutral">{card.register}</Badge>}
              <Badge tone="gradient">{card.level.replace('_PLUS', '+')}</Badge>
            </div>

            {card.noteVi && (
              <p className="mx-auto mb-6 max-w-prose border-l-2 border-l-acc pl-4 text-left text-sm text-fg2">
                {card.noteVi}
              </p>
            )}

            {card.related.length > 0 && (
              <div className="mx-auto mb-6 flex max-w-prose flex-wrap justify-center gap-2">
                {card.related.map((r) => (
                  <span
                    key={`${r.relation}-${r.entry.id}`}
                    className="rounded-sm bg-(image:--g-soft) px-2.5 py-1 text-xs text-acc-hi"
                  >
                    <span className="opacity-70">{VOCABULARY_RELATION_LABELS[r.relation] ?? r.relation}</span>{' '}
                    <span className="jp font-semibold">{r.entry.headword}</span>
                  </span>
                ))}
              </div>
            )}

            {card.examples.slice(0, 1).map((e) => (
              <div key={e.id} className="mx-auto max-w-prose text-left">
                <p className="jp text-sm leading-loose">{e.sentenceJa}</p>
                <p className="mt-1 text-xs text-fg2">{e.meaningVi}</p>
              </div>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-6 cursor-pointer rounded-lg border border-ln px-8 py-3.5 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
          >
            Hiện nghĩa
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VOCABULARY_RATINGS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => rate(r.value)}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-3 text-center transition-colors duration-200',
                r.tone === 'ng' && 'border-ng/40 text-ng hover:bg-ng-soft',
                r.tone === 'wr' && 'border-wr/40 text-wr hover:bg-wr-soft',
                r.tone === 'ok' && 'border-ok/40 text-ok hover:bg-ok-soft',
                r.tone === 'acc' && 'border-acc-dim text-acc-hi hover:bg-acc-soft',
              )}
            >
              <span className="block text-sm font-semibold">{r.label}</span>
              <span className="block text-xs opacity-70">{r.hint}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
