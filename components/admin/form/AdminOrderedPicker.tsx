'use client';

import { useState } from 'react';
import { FaArrowDown, FaArrowUp, FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

export type AdminPickOption = { id: string; label: string; hint?: string };

/**
 * Danh sách CÓ THỨ TỰ chọn từ một kho: tài liệu của group, group của bộ,
 * group của đề. Thứ tự là nghiệp vụ (audio trước bảng, group 1 trước group 2)
 * nên có nút lên/xuống, không kéo thả — kéo thả tự viết dễ hỏng trên mobile.
 */
export function AdminOrderedPicker({
  label,
  pool,
  value,
  onChange,
  emptyText = 'Chưa chọn gì.',
  error,
}: {
  label: string;
  pool: AdminPickOption[];
  /** Mảng id theo thứ tự. */
  value: string[];
  onChange: (ids: string[]) => void;
  emptyText?: string;
  error?: string;
}) {
  const [pick, setPick] = useState('');
  const byId = new Map(pool.map((p) => [p.id, p]));
  const remaining = pool.filter((p) => !value.includes(p.id));

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <ol className={cn('divide-y divide-ln border-y border-ln', value.length === 0 && 'border-0')}>
        {value.length === 0 && <li className="py-2 text-xs text-fg3">{emptyText}</li>}
        {value.map((id, i) => {
          const p = byId.get(id);
          return (
            <li key={id} className="flex items-center gap-2 py-2 text-sm">
              <span className="tnum w-5 flex-none text-xs text-fg3">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">
                {p?.label ?? id}
                {p?.hint && <span className="ml-2 text-xs text-fg3">{p.hint}</span>}
              </span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên" className="grid size-7 place-items-center rounded-md text-fg3 hover:bg-ln2 hover:text-fg disabled:opacity-30">
                <FaArrowUp className="size-3" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Xuống" className="grid size-7 place-items-center rounded-md text-fg3 hover:bg-ln2 hover:text-fg disabled:opacity-30">
                <FaArrowDown className="size-3" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} aria-label="Bỏ" className="grid size-7 place-items-center rounded-md text-fg3 hover:bg-ng-soft hover:text-ng">
                <FaXmark className="size-3" />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex items-end gap-2">
        <Select label={label} value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1">
          <option value="">— Chọn để thêm —</option>
          {remaining.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {p.hint ? ` · ${p.hint}` : ''}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          size="md"
          disabled={!pick}
          onClick={() => {
            if (!pick) return;
            onChange([...value, pick]);
            setPick('');
          }}
        >
          <FaPlus className="size-3" /> Thêm
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-ng">
          {error}
        </p>
      )}
    </div>
  );
}
