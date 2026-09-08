'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaArrowLeft, FaBars } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Tooltip } from '@/components/ui/Tooltip';
import { ADMIN_HOME, ADMIN_NAV_GROUPS } from '@/constants/admin/adminNav';
import { cn } from '@/lib/utils';

const KEY = 'bjt-admin-sidebar-open';
const EVENT = 'bjt-admin-sidebar';

/**
 * Trạng thái mở/đóng nhớ trong localStorage của trình duyệt này. Đọc qua
 * useSyncExternalStore để server render "đóng" (mặc định 60px theo CLAUDE.md)
 * rồi client tự cập nhật mà không lệch hydration và không setState trong effect.
 */
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}
function readOpen(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
function writeOpen(open: boolean) {
  try {
    localStorage.setItem(KEY, open ? '1' : '0');
  } catch {
    /* private mode: không nhớ, không sao */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function AdminSidebar({ name, initials }: { name: string; initials: string }) {
  const pathname = usePathname();
  const open = useSyncExternalStore(subscribe, readOpen, () => false);

  return (
    <nav
      aria-label="Điều hướng quản trị"
      className={cn(
        'sticky top-0 flex h-dvh flex-none flex-col border-r border-ln bg-bg',
        'transition-[width] duration-300 ease-smooth',
        open ? 'w-54' : 'w-15',
      )}
    >
      {/* Hamburger ở ĐẦU sidebar, theo CLAUDE.md. */}
      <button
        type="button"
        onClick={() => writeOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Thu gọn menu' : 'Mở rộng menu'}
        className="mx-3 mt-3 grid size-9 flex-none place-items-center rounded-lg text-fg2 transition-colors duration-200 hover:bg-ln2 hover:text-fg"
      >
        <FaBars className="size-3.5" />
      </button>

      <Link href="/admin" className="mx-3 mt-2 flex h-9 items-center gap-2.5 overflow-hidden px-1">
        <span className="grid size-7 flex-none place-items-center rounded-md bg-(image:--g) text-xs font-bold text-on-g shadow-btn-xs">
          B
        </span>
        <b className={cn('whitespace-nowrap text-sm font-bold', !open && 'sr-only')}>Quản trị</b>
      </Link>

      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto pb-3 [scrollbar-width:none]">
        <Item href="/" label="Về trang học" Icon={FaArrowLeft} active={false} open={open} />
        <Item
          href={ADMIN_HOME.href}
          label={ADMIN_HOME.label}
          Icon={ADMIN_HOME.Icon}
          active={pathname === '/admin'}
          open={open}
        />

        {ADMIN_NAV_GROUPS.map((g) => (
          <div key={g.label} className="mt-2 border-t border-ln pt-2">
            <div
              className={cn(
                'gt mb-1 px-5 text-xs font-bold uppercase tracking-wide transition-opacity duration-200',
                !open && 'h-0 opacity-0',
              )}
              aria-hidden={!open}
            >
              {g.label}
            </div>
            {g.items.map((it) => (
              <Item
                key={it.href}
                href={it.href}
                label={it.label}
                Icon={it.Icon}
                active={pathname.startsWith(it.href)}
                open={open}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-ln px-3 py-3">
        <span
          className="grid size-8 flex-none place-items-center rounded-full bg-(image:--g) text-xs font-bold text-on-g"
          title={name}
        >
          {initials}
        </span>
        <span className={cn('min-w-0 flex-1 truncate text-xs text-fg2', !open && 'sr-only')}>{name}</span>
        <span className={cn(!open && 'hidden')}>
          <ThemeToggle />
        </span>
      </div>
    </nav>
  );
}

function Item({
  href,
  label,
  Icon,
  active,
  open,
}: {
  href: string;
  label: string;
  Icon: IconType;
  active: boolean;
  open: boolean;
}) {
  const link = (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative mx-2 flex h-10 items-center gap-3 rounded-lg px-3 text-sm whitespace-nowrap',
        'transition-colors duration-150',
        active ? 'font-semibold text-acc-hi' : 'text-fg2 hover:text-fg',
      )}
    >
      {/* Nền mềm khi active/hover và vạch 3px gradient bên trái khi active — theo prototype. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 rounded-lg bg-(image:--g-soft) transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />
      {active && <span aria-hidden className="absolute -left-2 top-2 bottom-2 w-0.75 rounded-sm bg-(image:--g-line)" />}
      <Icon className="relative size-3.5 flex-none" />
      <span className={cn('relative', !open && 'sr-only')}>{label}</span>
    </Link>
  );
  // Thu gọn thì hover ra tooltip bên phải để vẫn biết icon là gì.
  return open ? (
    link
  ) : (
    <Tooltip label={label} side="right" className="flex w-full">
      {link}
    </Tooltip>
  );
}
