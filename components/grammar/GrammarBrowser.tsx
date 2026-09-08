'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { ListRow } from '@/components/common/ListRow';
import { SectionHeading } from '@/components/common/SectionHeading';
import { GRAMMAR_LEVELS, GRAMMAR_REGISTERS } from '@/constants/grammar/grammarFilters';
import type { GrammarPoint } from '@/lib/prisma-types';

export function GrammarBrowser({ points }: { points: GrammarPoint[] }) {
  const [level, setLevel] = useState<string | null>(null);
  const [register, setRegister] = useState<string | null>(null);

  const filtered = points.filter(
    (p) => (!level || p.level === level) && (!register || p.register === register),
  );

  return (
    <div className="px-6">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="mr-1 text-xs font-bold text-fg2">Mức độ</span>
        <Chip pressed={level === null} onClick={() => setLevel(null)}>
          Tất cả
        </Chip>
        {GRAMMAR_LEVELS.map((l) => (
          <Chip key={l} pressed={level === l} onClick={() => setLevel(l)}>
            {l.replace('_PLUS', '+')}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-8">
        <span className="mr-1 text-xs font-bold text-fg2">Tầng lịch sự</span>
        <Chip pressed={register === null} onClick={() => setRegister(null)}>
          Tất cả
        </Chip>
        {GRAMMAR_REGISTERS.map((r) => (
          <Chip key={r.value} pressed={register === r.value} onClick={() => setRegister(r.value)}>
            <span className="jp">{r.label}</span>
          </Chip>
        ))}
      </div>

      <SectionHeading title="Mẫu ngữ pháp" meta={`${filtered.length} mẫu`} />

      {filtered.length === 0 ? (
        <p className="py-8 text-sm text-fg3">Không có mẫu nào khớp bộ lọc này.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {filtered.map((p) => (
            <ListRow
              key={p.id}
              href={`/grammar/${p.slug}`}
              title={<span className="jp text-base">{p.pattern}</span>}
              subtitle={p.meaningVi}
              trailing={
                <span className="flex items-center gap-2">
                  {p.jlptLevel && <Badge tone="neutral">{p.jlptLevel}</Badge>}
                  <Badge tone="gradient">{p.level.replace('_PLUS', '+')}</Badge>
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
