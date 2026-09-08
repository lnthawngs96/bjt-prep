'use client';

import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import type { MaterialChartBody } from '@/types/common/material';

type Body = MaterialChartBody & { chartType: 'bar' };

/** Biểu đồ cột: các nhóm (trục X) và các dãy số. Nhập dãy dưới dạng số cách nhau bằng dấu phẩy. */
export function AdminChartSeriesEditor({ value, onChange, errors }: { value: Body; onChange: (v: Body) => void; errors: Record<string, string> }) {
  const n = value.categories.length;
  function setCategory(i: number, s: string) {
    onChange({ ...value, categories: value.categories.map((c, k) => (k === i ? s : c)) });
  }
  function setSeries(i: number, p: Partial<Body['series'][number]>) {
    onChange({ ...value, series: value.series.map((s, k) => (k === i ? { ...s, ...p } : s)) });
  }
  return (
    <div className="flex flex-col gap-3">
      <Field label="Tiêu đề biểu đồ" className="[&_input]:jp" value={value.caption ?? ''} onChange={(e) => onChange({ ...value, caption: e.target.value || undefined })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nhãn trục X" value={value.axisLabels?.x ?? ''} onChange={(e) => onChange({ ...value, axisLabels: { ...value.axisLabels, x: e.target.value || undefined } })} />
        <Field label="Nhãn trục Y" value={value.axisLabels?.y ?? ''} onChange={(e) => onChange({ ...value, axisLabels: { ...value.axisLabels, y: e.target.value || undefined } })} />
      </div>

      <p className="text-xs font-bold text-fg2">Nhóm trên trục X</p>
      <div className="flex flex-wrap gap-2">
        {value.categories.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            <input aria-label={`Nhóm ${i + 1}`} value={c} onChange={(e) => setCategory(i, e.target.value)} className="jp w-32 rounded-md border border-ln bg-bg px-2 py-1.5 text-sm outline-none focus:border-acc" />
            <button type="button" aria-label="Bỏ nhóm" disabled={n <= 1} onClick={() => onChange({ ...value, categories: value.categories.filter((_, k) => k !== i), series: value.series.map((s) => ({ ...s, values: s.values.filter((_, k) => k !== i) })) })} className="cursor-pointer grid size-6 place-items-center rounded text-fg3 hover:bg-ng-soft hover:text-ng disabled:opacity-30">
              <FaXmark className="size-2.5" />
            </button>
          </span>
        ))}
        <Button type="button" size="sm" onClick={() => onChange({ ...value, categories: [...value.categories, ''], series: value.series.map((s) => ({ ...s, values: [...s.values, 0] })) })}>
          <FaPlus className="size-3" /> Nhóm
        </Button>
      </div>
      {errors['body.categories'] && <p role="alert" className="text-xs text-ng">{errors['body.categories']}</p>}

      <p className="text-xs font-bold text-fg2">Các dãy số</p>
      {value.series.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-end gap-2">
          <Field label="Tên dãy" className="[&_input]:jp" value={s.name} onChange={(e) => setSeries(i, { name: e.target.value })} />
          <Field
            label={`Giá trị (${n} số, cách nhau bằng dấu phẩy)`}
            value={s.values.join(', ')}
            onChange={(e) =>
              setSeries(i, {
                values: e.target.value
                  .split(',')
                  .map((x) => Number(x.trim()))
                  .map((x) => (Number.isFinite(x) ? x : 0)),
              })
            }
          />
          <button type="button" aria-label="Bỏ dãy" disabled={value.series.length <= 1} onClick={() => onChange({ ...value, series: value.series.filter((_, k) => k !== i) })} className="cursor-pointer mb-2 grid size-8 place-items-center rounded-md text-fg3 hover:bg-ng-soft hover:text-ng disabled:opacity-30">
            <FaXmark className="size-3" />
          </button>
        </div>
      ))}
      <Button type="button" size="sm" className="self-start" onClick={() => onChange({ ...value, series: [...value.series, { name: '', values: Array(n).fill(0) }] })}>
        <FaPlus className="size-3" /> Thêm dãy
      </Button>
    </div>
  );
}
