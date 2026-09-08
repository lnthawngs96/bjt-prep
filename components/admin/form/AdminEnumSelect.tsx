'use client';

import { Select, type SelectProps } from '@/components/ui/Select';

/**
 * Select cho enum: nhận map giá trị → nhãn. Dùng cho status, level, register…
 * `allowEmpty` thêm dòng trống cho trường nullable.
 */
export function AdminEnumSelect<T extends string>({
  options,
  order,
  allowEmpty,
  emptyLabel = '— Không —',
  value,
  onValue,
  ...props
}: Omit<SelectProps, 'value' | 'onChange' | 'children'> & {
  options: Record<T, string>;
  /** Thứ tự hiện; mặc định theo thứ tự khai báo của map. */
  order?: readonly T[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  value: T | null | undefined;
  onValue: (v: T | null) => void;
}) {
  const keys = order ?? (Object.keys(options) as T[]);
  return (
    <Select value={value ?? ''} onChange={(e) => onValue((e.target.value || null) as T | null)} {...props}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {keys.map((k) => (
        <option key={k} value={k}>
          {options[k]}
        </option>
      ))}
    </Select>
  );
}
