'use client';

import { Field } from '@/components/ui/Field';
import { AdminEnumSelect } from './AdminEnumSelect';
import { AdminFormRow } from './AdminFormSection';
import { CONTENT_SOURCE_LABELS } from '@/constants/common/contentSources';

/**
 * Hai ô ghi nguồn tham khảo, dùng chung cho từ vựng · ngữ pháp · nhóm câu hỏi.
 *
 * Ghi nguồn nghĩa là "soạn theo tham khảo", KHÔNG phải "trích nguyên văn" —
 * xem docs/sources.md. Sách chưa có trong constants/common/contentSources.ts thì
 * thêm vào đó, không cần migration.
 */
export function AdminSourceFields({
  sourceKey,
  sourceLocator,
  onSourceKey,
  onSourceLocator,
}: {
  sourceKey: string | null;
  sourceLocator: string | null;
  onSourceKey: (v: string | null) => void;
  onSourceLocator: (v: string | null) => void;
}) {
  // Khoá cũ không còn trong sổ đăng ký vẫn phải chọn được, nếu không select sẽ
  // âm thầm nhảy sang mục đầu và ghi đè mất nguồn.
  const options: Record<string, string> =
    sourceKey && !(sourceKey in CONTENT_SOURCE_LABELS)
      ? { ...CONTENT_SOURCE_LABELS, [sourceKey]: `${sourceKey} (chưa đăng ký)` }
      : CONTENT_SOURCE_LABELS;

  return (
    <AdminFormRow>
      <AdminEnumSelect
        label="Nguồn tham khảo"
        options={options}
        allowEmpty
        emptyLabel="— Tự viết, không theo sách nào —"
        value={sourceKey}
        onValue={onSourceKey}
      />
      <Field
        label="Vị trí trong sách"
        placeholder="tr. 42 · 別冊 p.12 · 第2部 練習3"
        value={sourceLocator ?? ''}
        onChange={(e) => onSourceLocator(e.target.value || null)}
      />
    </AdminFormRow>
  );
}
