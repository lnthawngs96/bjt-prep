import Link from 'next/link';
import type { ReactNode } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { StartAttemptButton } from '@/components/common/StartAttemptButton';
import { cn } from '@/lib/utils';

interface Content {
  index?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
}

export type ListRowProps = Content & {
  className?: string;
} & (
    | { href: string; questionSetId?: never; mockTestId?: never }
    // Mở lượt làm bài qua API thay vì điều hướng thẳng — server sinh id.
    | { href?: never; questionSetId: string; mockTestId?: never }
    | { href?: never; questionSetId?: never; mockTestId: string }
  );

/** Dòng danh sách — hover nền mềm, không gạch ngang giữa các dòng. */
const ROW =
  'group relative -mx-6 flex w-full items-center gap-3.5 rounded-lg px-6 py-3.5 ' +
  'text-left transition-colors duration-150 hover:bg-ln2';

/**
 * Một dòng trong danh sách. Phân tách bằng khoảng trắng và hover,
 * không dùng card hay gạch ngang — xem "Quy tắc giao diện" trong CLAUDE.md.
 */
export function ListRow({ className, href, questionSetId, mockTestId, ...content }: ListRowProps) {
  const inner = <RowContent {...content} />;

  if (href) {
    return (
      <Link href={href} className={cn(ROW, className)}>
        {inner}
      </Link>
    );
  }

  return (
    <StartAttemptButton
      questionSetId={questionSetId}
      mockTestId={mockTestId}
      className={cn(ROW, className)}
    >
      {inner}
    </StartAttemptButton>
  );
}

function RowContent({ index, title, subtitle, meta, trailing }: Content) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-left scale-x-95 rounded-lg bg-(image:--g-soft) opacity-0',
          'transition-all duration-300 ease-smooth',
          'group-hover:scale-x-100 group-hover:opacity-100',
        )}
      />
      {index != null && (
        <span className="relative w-3.5 flex-none text-xs tabular-nums text-fg3">{index}</span>
      )}
      <span className="relative min-w-0 flex-1">
        <b className="block text-sm font-medium">{title}</b>
        {subtitle && <span className="block text-xs text-fg2">{subtitle}</span>}
      </span>
      {meta && <span className="relative flex-none text-xs text-fg3">{meta}</span>}
      {trailing && <span className="relative flex-none">{trailing}</span>}
      <span
        aria-hidden
        className={cn(
          'relative grid size-7 flex-none place-items-center rounded-full border border-ln',
          'transition-colors duration-200 group-hover:border-transparent group-hover:text-on-g',
        )}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 bg-(image:--g) opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </span>
        <FaChevronRight className="relative size-2.5 transition-transform duration-300 ease-overshoot group-hover:translate-x-0.5" />
      </span>
    </>
  );
}
