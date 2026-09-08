import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'gradient' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Hiện spinner thay nội dung và khoá nút. */
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  gradient:
    'bg-(image:--g) text-on-g font-semibold border border-transparent shadow-btn-sm hover:brightness-110',
  outline: 'border border-ln text-fg hover:border-acc-dim hover:bg-ln2',
  ghost: 'border border-transparent text-fg2 hover:bg-ln2 hover:text-fg',
  danger: 'border border-ng/40 text-ng hover:bg-ng-soft',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-sm rounded-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center whitespace-nowrap',
        'transition-all duration-200',
        'active:scale-98 disabled:pointer-events-none disabled:opacity-55',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
});

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-ln border-t-acc motion-reduce:animate-none"
    />
  );
}
