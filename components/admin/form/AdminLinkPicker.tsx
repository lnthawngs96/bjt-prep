'use client';

import { useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { AdminPickOption } from './AdminOrderedPicker';

export type AdminLink = { id: string; relevance: 'tested' | 'appears' };

const RELEVANCE_LABEL = { tested: 'Được kiểm tra', appears: 'Xuất hiện' } as const;

/**
 * Liên kết ngược câu hỏi → từ vựng / ngữ pháp, kèm mức liên quan.
 * "tested" là thứ câu hỏi đang kiểm; "appears" chỉ xuất hiện trong bài.
 * Màn kết quả xếp "tested" lên trước.
 */
export function AdminLinkPicker({
  label,
  pool,
  value,
  onChange,
}: {
  label: string;
  pool: AdminPickOption[];
  value: AdminLink[];
  onChange: (links: AdminLink[]) => void;
}) {
  const [pick, setPick] = useState('');
  const [relevance, setRelevance] = useState<AdminLink['relevance']>('tested');
  const byId = new Map(pool.map((p) => [p.id, p]));
  const chosen = new Set(value.map((v) => v.id));

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-1.5">
        {value.length === 0 && <li className="text-xs text-fg3">Chưa liên kết.</li>}
        {value.map((v) => (
          <li
            key={v.id}
            className="flex items-center gap-1.5 rounded-md bg-(image:--g-soft) py-1 pl-2.5 pr-1 text-xs text-acc-hi"
          >
            <span className="jp font-semibold">{byId.get(v.id)?.label ?? v.id}</span>
            <span className="opacity-70">· {RELEVANCE_LABEL[v.relevance]}</span>
            <button
              type="button"
              aria-label="Bỏ"
              onClick={() => onChange(value.filter((x) => x.id !== v.id))}
              className="grid size-5 place-items-center rounded hover:bg-ng-soft hover:text-ng"
            >
              <FaXmark className="size-2.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-end gap-2">
        <Select label={label} value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1">
          <option value="">— Chọn —</option>
          {pool
            .filter((p) => !chosen.has(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
                {p.hint ? ` · ${p.hint}` : ''}
              </option>
            ))}
        </Select>
        <Select
          label="Mức"
          value={relevance}
          onChange={(e) => setRelevance(e.target.value as AdminLink['relevance'])}
          className="w-36"
        >
          <option value="tested">{RELEVANCE_LABEL.tested}</option>
          <option value="appears">{RELEVANCE_LABEL.appears}</option>
        </Select>
        <Button
          type="button"
          disabled={!pick}
          onClick={() => {
            if (!pick) return;
            onChange([...value, { id: pick, relevance }]);
            setPick('');
          }}
        >
          <FaPlus className="size-3" /> Thêm
        </Button>
      </div>
    </div>
  );
}
