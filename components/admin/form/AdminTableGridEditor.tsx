'use client';

import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { AdminCheckbox } from './AdminCheckbox';
import type { MaterialTableBody } from '@/types/common/material';

type Body = Required<Pick<MaterialTableBody, 'headers' | 'rows' | 'numericColumns'>> & { caption?: string };

/** Lưới bảng số liệu: thêm cột, thêm dòng, đánh dấu cột số để căn phải. */
export function AdminTableGridEditor({ value, onChange, errors }: { value: Body; onChange: (v: Body) => void; errors: Record<string, string> }) {
  const cols = value.headers.length;

  function setHeader(j: number, h: string) {
    onChange({ ...value, headers: value.headers.map((x, k) => (k === j ? h : x)) });
  }
  function setCell(i: number, j: number, v: string) {
    onChange({ ...value, rows: value.rows.map((r, k) => (k === i ? r.map((c, l) => (l === j ? v : c)) : r)) });
  }
  function addCol() {
    onChange({ ...value, headers: [...value.headers, ''], rows: value.rows.map((r) => [...r, '']) });
  }
  function removeCol(j: number) {
    onChange({
      ...value,
      headers: value.headers.filter((_, k) => k !== j),
      rows: value.rows.map((r) => r.filter((_, k) => k !== j)),
      numericColumns: value.numericColumns.filter((c) => c !== j).map((c) => (c > j ? c - 1 : c)),
    });
  }
  function toggleNumeric(j: number) {
    const has = value.numericColumns.includes(j);
    onChange({ ...value, numericColumns: has ? value.numericColumns.filter((c) => c !== j) : [...value.numericColumns, j] });
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Tiêu đề bảng" className="[&_input]:jp" value={value.caption ?? ''} onChange={(e) => onChange({ ...value, caption: e.target.value || undefined })} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {value.headers.map((h, j) => (
                <th key={j} className="border border-ln p-1 align-top">
                  <input aria-label={`Tiêu đề cột ${j + 1}`} value={h} onChange={(e) => setHeader(j, e.target.value)} className="jp w-full min-w-24 bg-transparent px-1.5 py-1 text-xs font-semibold outline-none focus:bg-ln2" />
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <AdminCheckbox label="Số" className="text-xs" checked={value.numericColumns.includes(j)} onChange={() => toggleNumeric(j)} />
                    <button type="button" aria-label="Bỏ cột" disabled={cols <= 1} onClick={() => removeCol(j)} className="grid size-6 place-items-center rounded text-fg3 hover:bg-ng-soft hover:text-ng disabled:opacity-30">
                      <FaXmark className="size-2.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="border border-ln p-1">
                <button type="button" onClick={addCol} aria-label="Thêm cột" className="grid size-7 place-items-center rounded text-fg3 hover:bg-ln2 hover:text-fg">
                  <FaPlus className="size-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {value.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className="border border-ln p-0">
                    <input aria-label={`Ô dòng ${i + 1} cột ${j + 1}`} value={c} onChange={(e) => setCell(i, j, e.target.value)} className="jp w-full bg-transparent px-2 py-1.5 outline-none focus:bg-ln2" />
                  </td>
                ))}
                <td className="border border-ln p-1">
                  <button type="button" aria-label="Bỏ dòng" disabled={value.rows.length <= 1} onClick={() => onChange({ ...value, rows: value.rows.filter((_, k) => k !== i) })} className="grid size-6 place-items-center rounded text-fg3 hover:bg-ng-soft hover:text-ng disabled:opacity-30">
                    <FaXmark className="size-2.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" size="sm" className="self-start" onClick={() => onChange({ ...value, rows: [...value.rows, Array(cols).fill('')] })}>
        <FaPlus className="size-3" /> Thêm dòng
      </Button>
      {(errors['body.headers'] || errors['body.rows']) && (
        <p role="alert" className="text-xs text-ng">
          {errors['body.headers'] ?? errors['body.rows']}
        </p>
      )}
    </div>
  );
}
