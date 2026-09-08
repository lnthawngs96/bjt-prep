'use client';

import { Chip } from '@/components/ui/Chip';
import type { Tag } from '@/lib/prisma-types';

const CATEGORY_LABEL: Record<string, string> = {
  function: 'Chức năng ngôn ngữ',
  document: 'Loại tài liệu',
  scenario: 'Bối cảnh',
  skill: 'Kỹ năng',
};

/** Nhãn kỹ năng dạng chip bật/tắt, gom theo category. Đây là nguồn của "Đang yếu nhất". */
export function AdminTagPicker({
  tags,
  value,
  onChange,
}: {
  tags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const categories = [...new Set(tags.map((t) => t.category))];
  const selected = new Set(value);
  return (
    <div className="flex flex-col gap-3">
      {categories.map((c) => (
        <div key={c}>
          <p className="mb-1.5 text-xs text-fg3">{CATEGORY_LABEL[c] ?? c}</p>
          <div className="flex flex-wrap gap-1.5">
            {tags
              .filter((t) => t.category === c)
              .map((t) => (
                <Chip
                  key={t.id}
                  pressed={selected.has(t.id)}
                  onClick={() =>
                    onChange(selected.has(t.id) ? value.filter((x) => x !== t.id) : [...value, t.id])
                  }
                >
                  {t.nameVi}
                </Chip>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
