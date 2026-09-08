'use client';

import type { ReactNode } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Chip } from '@/components/ui/Chip';

/** Thanh lọc: chip + ô tìm — theo prototype `.abar`. */
export function AdminFilterBar({
  chips,
  search,
  onSearch,
  placeholder = 'Tìm…',
  children,
}: {
  chips: { id: string; label: ReactNode; pressed: boolean; onClick: () => void }[];
  search: string;
  onSearch: (s: string) => void;
  placeholder?: string;
  /** Nút thêm bên phải. */
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Chip key={c.id} pressed={c.pressed} onClick={c.onClick}>
          {c.label}
        </Chip>
      ))}
      <label className="relative min-w-48 flex-1">
        <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-fg3" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-md border border-ln bg-bg py-2 pl-8 pr-3 text-sm outline-none transition-colors duration-200 placeholder:text-fg3 focus:border-acc"
        />
      </label>
      {children}
    </div>
  );
}
