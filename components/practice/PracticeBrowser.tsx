'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import { TabPanel, Tabs } from '@/components/ui/Tabs';
import { ListRow } from '@/components/common/ListRow';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/utils';
import type { PartWithSections, QuestionSetSummary } from '@/lib/data/types';

export interface PracticeBrowserProps {
  parts: PartWithSections[];
  /** Bộ luyện tập theo từng section, nạp sẵn ở server. */
  setsBySection: Record<string, QuestionSetSummary[]>;
}

export function PracticeBrowser({ parts, setsBySection }: PracticeBrowserProps) {
  const [partCode, setPartCode] = useState(parts[1]?.code ?? parts[0].code);
  const part = parts.find((p) => p.code === partCode) ?? parts[0];
  const [sectionCode, setSectionCode] = useState<string>(part.sections[1]?.code ?? part.sections[0].code);

  // Đổi phần thì section hiện tại có thể không còn thuộc phần đó nữa.
  const section = part.sections.find((s) => s.code === sectionCode) ?? part.sections[0];
  const sets = setsBySection[section.code] ?? [];

  function selectPart(code: string) {
    const nextPart = parts.find((p) => p.code === code);
    if (!nextPart) return;
    setPartCode(nextPart.code);
    setSectionCode(nextPart.sections[0].code);
  }

  return (
    <>
      <Tabs
        aria-label="Ba phần của đề BJT"
        value={part.code}
        onChange={selectPart}
        items={parts.map((p) => ({
          id: p.code,
          label: <span className="jp">{p.nameJa}</span>,
          hint: `${p.nameVi} · ${p.questionCount} câu`,
        }))}
      />

      <TabPanel id={part.code}>
        <div className="flex flex-wrap gap-2 pt-4">
          {part.sections.map((s) => (
            <Chip
              key={s.code}
              pressed={s.code === section.code}
              onClick={() => setSectionCode(s.code)}
            >
              Section {s.order} · <span className="jp">{s.nameJa.replace('問題', '')}</span>
            </Chip>
          ))}
        </div>

        <section className="pb-7 pt-5">
          <SectionHeading
            title={`Section ${section.order} — ${section.nameVi.toLowerCase()}`}
            meta={`${sets.length} bộ · ${sets.reduce((n, s) => n + s.questionCount, 0)} câu`}
            action={
              <Link href="/grammar" className="gt">
                Hướng dẫn dạng câu này
              </Link>
            }
          />
          {section.descriptionVi && (
            <p className="mb-4 max-w-prose text-sm text-fg2">{section.descriptionVi}</p>
          )}

          {sets.length === 0 ? (
            <p className="border-y border-ln py-10 text-center text-sm text-fg3">
              Chưa có bộ luyện tập nào cho section này.
            </p>
          ) : (
            sets.map((s) => (
              <ListRow
                key={s.id}
                questionSetId={s.id}
                index={s.indexNo}
                title={s.titleVi}
                subtitle={s.descVi}
                trailing={
                  <span className="flex items-center gap-2.5">
                    <span className="rounded-sm border border-transparent bg-(image:--g-soft) px-1.5 py-0.5 text-xs font-semibold text-acc-hi">
                      {s.level.replace('_PLUS', '+')}
                    </span>
                    <span
                      className={cn(
                        'w-11 text-right text-xs font-semibold tabular-nums',
                        !s.lastResult && 'text-fg3',
                        s.lastResult && s.lastResult.correct / s.lastResult.total >= 0.7 && 'text-ok',
                        s.lastResult && s.lastResult.correct / s.lastResult.total < 0.7 && 'text-ng',
                      )}
                    >
                      {s.lastResult ? `${s.lastResult.correct}/${s.lastResult.total}` : '—'}
                    </span>
                  </span>
                }
              />
            ))
          )}
        </section>
      </TabPanel>
    </>
  );
}
