'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { ListRow } from '@/components/student/ListRow';
import type { GrammarPoint } from '@/lib/prisma-types';

const LEVELS = ['J4', 'J3', 'J2', 'J1', 'J1_PLUS'] as const;
const REGISTERS = [
  { value: 'SONKEIGO', label: '尊敬語 · Tôn kính' },
  { value: 'KENJOUGO', label: '謙譲語 · Khiêm nhường' },
  { value: 'TEINEIGO', label: '丁寧語 · Lịch sự' },
  { value: 'WRITTEN', label: 'Văn viết' },
  { value: 'PLAIN', label: 'Thường' },
] as const;

export function GrammarBrowser({ points }: { points: GrammarPoint[] }) {
  const [level, setLevel] = useState<string | null>(null);
  const [register, setRegister] = useState<string | null>(null);

  const filtered = points.filter(
    (p) => (!level || p.level === level) && (!register || p.register === register),
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-[7px] pb-3">
        <span className="mr-1 text-[11px] font-bold text-fg2">Mức độ</span>
        <Chip pressed={level === null} onClick={() => setLevel(null)}>
          Tất cả
        </Chip>
        {LEVELS.map((l) => (
          <Chip key={l} pressed={level === l} onClick={() => setLevel(l)}>
            {l.replace('_PLUS', '+')}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-[7px] pb-6">
        <span className="mr-1 text-[11px] font-bold text-fg2">Tầng lịch sự</span>
        <Chip pressed={register === null} onClick={() => setRegister(null)}>
          Tất cả
        </Chip>
        {REGISTERS.map((r) => (
          <Chip key={r.value} pressed={register === r.value} onClick={() => setRegister(r.value)}>
            <span className="jp">{r.label}</span>
          </Chip>
        ))}
      </div>

      <div className="mb-3 flex items-baseline gap-3 border-t border-ln pt-6">
        <h2 className="text-[15px] font-semibold">Mẫu ngữ pháp</h2>
        <span className="text-xs tabular-nums text-fg3">{filtered.length} mẫu</span>
      </div>

      {filtered.length === 0 ? (
        <p className="border-y border-ln py-10 text-center text-[13.5px] text-fg3">
          Không có mẫu nào khớp bộ lọc này.
        </p>
      ) : (
        filtered.map((p) => (
          <ListRow
            key={p.id}
            href={`/grammar/${p.slug}`}
            title={<span className="jp text-[16px]">{p.pattern}</span>}
            subtitle={p.meaningVi}
            trailing={
              <span className="flex items-center gap-2">
                {p.jlptLevel && <Badge tone="neutral">{p.jlptLevel}</Badge>}
                <Badge tone="gradient">{p.level.replace('_PLUS', '+')}</Badge>
              </span>
            }
          />
        ))
      )}
    </>
  );
}
