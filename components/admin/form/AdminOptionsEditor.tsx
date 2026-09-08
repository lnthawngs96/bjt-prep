'use client';

import { Field, TextareaField } from '@/components/ui/Field';
import type { QuestionOptionInput } from '@/lib/validation/admin/question';
import { cn } from '@/lib/utils';

/**
 * Bốn phương án. Ô số bên trái là nút chọn đáp án đúng — đúng một cái.
 * Ở L1/L2/LR1 (phương án đọc trong audio) chữ được để trống; bật `spoken`
 * để form nhắc và cho phép trống, nhưng distractorNote thì vẫn nên có.
 */
export function AdminOptionsEditor({
  value,
  onChange,
  spoken,
  errors,
}: {
  value: QuestionOptionInput[];
  onChange: (v: QuestionOptionInput[]) => void;
  spoken: boolean;
  errors: Record<string, string>;
}) {
  function patch(i: number, p: Partial<QuestionOptionInput>) {
    onChange(value.map((o, j) => (j === i ? { ...o, ...p } : o)));
  }
  function markCorrect(i: number) {
    onChange(value.map((o, j) => ({ ...o, isCorrect: j === i })));
  }

  return (
    <div className="flex flex-col gap-4" role="radiogroup" aria-label="Đáp án đúng">
      {spoken && (
        <p className="text-xs text-fg3">
          Section này đọc phương án trong audio: chữ phương án để trống, ghi lời đọc vào transcript của
          tài liệu audio. distractorNote vẫn nên viết để màn xem lại giải thích được.
        </p>
      )}
      {value.map((o, i) => (
        <div key={o.order} className="flex gap-3">
          <button
            type="button"
            role="radio"
            aria-checked={o.isCorrect}
            aria-label={`Phương án ${o.order} là đáp án đúng`}
            onClick={() => markCorrect(i)}
            className={cn(
              'cursor-pointer tnum mt-6 grid size-6 flex-none place-items-center rounded-md border text-xs font-bold transition-colors duration-200',
              o.isCorrect
                ? 'border-transparent bg-linear-to-br from-ok to-[#23c9c2] text-white'
                : 'border-ln text-fg3 hover:border-acc-dim',
            )}
          >
            {o.order}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Field
              label={`Phương án ${o.order}${o.isCorrect ? ' — đáp án đúng' : ''}`}
              className="[&_input]:jp"
              value={o.textJa ?? ''}
              placeholder={spoken ? '(đọc trong audio)' : ''}
              onChange={(e) => patch(i, { textJa: e.target.value || null })}
              error={errors[`options.${i}.textJa`]}
            />
            {!o.isCorrect && (
              <TextareaField
                label="Vì sao phương án này sai"
                rows={2}
                value={o.distractorNote ?? ''}
                onChange={(e) => patch(i, { distractorNote: e.target.value || null })}
                error={errors[`options.${i}.distractorNote`]}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
