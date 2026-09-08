'use client';

import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import type { TranscriptLineInput } from '@/lib/validation/admin/material';

const EMPTY: TranscriptLineInput = { speaker: '', role: 'staff', text: '', startMs: 0, endMs: 0 };

/**
 * Transcript audio từng lượt nói, có startMs/endMs. Đây là thứ cho phép màn
 * xem lại đánh dấu đúng câu học viên nghe sót, và với L1/L2/LR1 nó ghi cả
 * câu hỏi lẫn bốn phương án được đọc.
 */
export function AdminTranscriptEditor({
  value,
  onChange,
  errors,
}: {
  value: TranscriptLineInput[];
  onChange: (v: TranscriptLineInput[]) => void;
  errors: Record<string, string>;
}) {
  function patch(i: number, p: Partial<TranscriptLineInput>) {
    onChange(value.map((l, j) => (j === i ? { ...l, ...p } : l)));
  }
  return (
    <div className="flex flex-col gap-4">
      {value.map((l, i) => (
        <div key={i} className="border-l-2 border-ln pl-3">
          <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2">
            <Field label="Người nói" value={l.speaker} onChange={(e) => patch(i, { speaker: e.target.value })} error={errors[`transcript.${i}.speaker`]} />
            <Field label="Vai" value={l.role} placeholder="boss · staff · client · narrator · option" onChange={(e) => patch(i, { role: e.target.value })} error={errors[`transcript.${i}.role`]} />
            <Field label="Bắt đầu (ms)" type="number" min={0} value={l.startMs} onChange={(e) => patch(i, { startMs: Number(e.target.value) })} error={errors[`transcript.${i}.startMs`]} />
            <Field label="Kết thúc (ms)" type="number" min={0} value={l.endMs} onChange={(e) => patch(i, { endMs: Number(e.target.value) })} error={errors[`transcript.${i}.endMs`]} />
            <button type="button" aria-label="Bỏ dòng" onClick={() => onChange(value.filter((_, j) => j !== i))} className="cursor-pointer mb-2 grid size-8 place-items-center rounded-md text-fg3 hover:bg-ng-soft hover:text-ng">
              <FaXmark className="size-3" />
            </button>
          </div>
          <TextareaField label="Lời" rows={2} className="[&_textarea]:jp" value={l.text} onChange={(e) => patch(i, { text: e.target.value })} error={errors[`transcript.${i}.text`]} />
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        className="self-start"
        onClick={() => {
          const last = value[value.length - 1];
          onChange([...value, { ...EMPTY, startMs: last?.endMs ?? 0, endMs: last?.endMs ?? 0 }]);
        }}
      >
        <FaPlus className="size-3" /> Thêm lượt nói
      </Button>
    </div>
  );
}
