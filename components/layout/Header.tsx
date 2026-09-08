'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaShieldHalved } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { NAV_ITEMS } from '@/constants/common/navItems';
import { useAuthDialog } from '@/stores/common/authDialogStore';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  /** null khi chưa đăng nhập. */
  user: { name: string; initials: string; isAdmin: boolean } | null;
  /** Chỉ có khi đã đăng nhập. */
  score: number | null;
  level: string | null;
  dueVocabCount: number;
}

export function Header({ user, score, level, dueVocabCount }: HeaderProps) {
  const pathname = usePathname();
  const showLogin = useAuthDialog((s) => s.show);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  // Ẩn khi cuộn xuống quá 90px, hiện lại khi cuộn lên. Ngưỡng 4px để
  // không giật khi cuộn bằng trackpad.
  //
  // Nghe trên `document` chứ không phải `window`: scroll của viewport được
  // phát với target là document, và có môi trường nó không tới được window.
  // Nghe đúng chỗ event sinh ra thì không phụ thuộc vào chuyện đó.
  useEffect(() => {
    function onScroll() {
      const y = Math.max(0, window.scrollY);
      if (y > 90 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y < 90) setHidden(false);
      lastY.current = y;
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  // Đóng menu di động khi đổi trang. Điều chỉnh state ngay trong lúc render
  // thay vì dùng useEffect — đây là cách React khuyến nghị cho state dẫn xuất,
  // và tránh một lượt render thừa với menu vẫn đang mở.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 px-6',
        'border-b border-ln bg-(--hdbg) shadow-hd backdrop-blur-md backdrop-saturate-180',
        'transition-transform duration-300 ease-in-out',
        hidden && '-translate-y-full',
      )}
    >
      <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-(image:--g-line) opacity-45" />

      <Link href="/" className="mr-5 flex flex-none items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-md bg-(image:--g) text-xs font-bold text-on-g shadow-btn-xs">
          B
        </span>
        <b className="text-base font-bold tracking-tight">BJT</b>
      </Link>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="student-nav"
        aria-label="Mở menu điều hướng"
        className="grid size-8 place-items-center rounded-lg border border-ln text-fg3 nav:hidden"
      >
        <FaBars className="size-3.5" />
      </button>

      <nav
        id="student-nav"
        className={cn(
          'flex min-w-0 flex-1 gap-0.5 overflow-x-auto [scrollbar-width:none]',
          'max-nav:fixed max-nav:inset-x-0 max-nav:top-14 max-nav:flex-col',
          'max-nav:overflow-visible max-nav:border-b max-nav:border-ln',
          'max-nav:bg-bg max-nav:p-2',
          !menuOpen && 'max-nav:hidden',
        )}
      >
        {NAV_ITEMS.map(({ href, label, Icon, ...rest }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={active}>
              {'badge' in rest && dueVocabCount > 0 && (
                <span className="rounded-lg bg-(image:--g) px-1.5 py-px text-xs font-bold tabular-nums text-on-g">
                  {dueVocabCount}
                </span>
              )}
            </NavLink>
          );
        })}
        {/* Mục "Quản trị" chỉ hiện khi role === 'ADMIN'. */}
        {user?.isAdmin && (
          <NavLink
            href="/admin"
            label="Quản trị"
            Icon={FaShieldHalved}
            active={pathname.startsWith('/admin')}
          />
        )}
      </nav>

      <div className="flex flex-none items-center gap-2.5 border-l border-ln pl-3.5">
        {user && score != null && level != null && (
          <Link
            href="/mock-test"
            className="hidden items-baseline gap-1.5 rounded-2xl border border-ln px-2.5 py-1.5 sm:flex"
            title="Điểm tham khảo trên thang 800"
          >
            <b className="gt text-sm font-bold tabular-nums">{score}</b>
            <span className="text-xs text-fg3">{level.replace('_PLUS', '+')}</span>
          </Link>
        )}
        <ThemeToggle />
        {user ? (
          <UserMenu name={user.name} initials={user.initials} />
        ) : (
          // Mở dialog TẠI CHỖ, không điều hướng — người dùng đang xem dở
          // trang nào thì ở lại đúng trang đó.
          <button
            type="button"
            onClick={() => showLogin({ callbackURL: pathname })}
            className="flex-none rounded-lg bg-(image:--g) px-3.5 py-2 text-xs font-semibold text-on-g transition duration-200 hover:brightness-110"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
  children,
}: {
  href: string;
  label: string;
  Icon: IconType;
  active: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm',
        'transition-colors duration-150',
        active ? 'font-semibold text-acc-hi' : 'text-fg2 hover:text-fg',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 rounded-lg bg-(image:--g-soft) transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />
      <Icon className={cn('relative size-3.5 flex-none', active ? 'opacity-100' : 'opacity-80')} />
      <span className="relative">{label}</span>
      {children && <span className="relative">{children}</span>}
    </Link>
  );
}
