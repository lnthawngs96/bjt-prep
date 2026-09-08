'use client';

import { useEffect, useRef, useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaShieldHalved, FaXmark } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { signalNavigationStart } from '@/components/common/NavigationProgress';
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

  const navLinks = (
    <>
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
      {user?.isAdmin && (
        <NavLink
          href="/admin"
          label="Quản trị"
          Icon={FaShieldHalved}
          active={pathname.startsWith('/admin')}
        />
      )}
    </>
  );

  return (
    <header
      className={cn(
        // w-full + max-w-full: không cho header kéo rộng hơn viewport (mobile).
        'fixed inset-x-0 top-0 z-50 w-full max-w-full',
        'border-b border-ln bg-(--hdbg) shadow-hd backdrop-blur-md backdrop-saturate-180',
        'transition-transform duration-300 ease-in-out',
        hidden && '-translate-y-full',
      )}
    >
      <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-(image:--g-line) opacity-45" />

      {/*
        Hàng điều khiển: justify-between, hai đầu shrink đúng chỗ.
        px-4 trên mobile hẹp, px-6 từ sm — khớp nội dung, tránh tràn.
      */}
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-content items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          onClick={signalNavigationStart}
          className="flex shrink-0 cursor-pointer items-center"
          aria-label="BJT — Trang chủ"
        >
          <span className="grid size-7 place-items-center rounded-md bg-(image:--g) text-xs font-bold text-on-g shadow-btn-xs">
            B
          </span>
        </Link>

        {/* Desktop: nav ngang — min-w-0 + overflow để không đẩy header tràn. */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] nav:flex"
        >
          {navLinks}
        </nav>

        {/* Desktop: điểm · theme · tài khoản */}
        <div className="hidden shrink-0 items-center gap-2.5 border-l border-ln pl-3.5 nav:flex">
          {user && score != null && level != null && (
            <Link
              href="/mock-test"
              onClick={signalNavigationStart}
              className="hidden cursor-pointer items-baseline gap-1.5 rounded-2xl border border-ln px-2.5 py-1.5 sm:flex"
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
            <button
              type="button"
              onClick={() => showLogin({ callbackURL: pathname })}
              className="shrink-0 cursor-pointer rounded-lg bg-(image:--g) px-3.5 py-2 text-xs font-semibold text-on-g transition duration-200 hover:brightness-110"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Mobile (< nav / 860px, gồm <768px): chỉ theme + hamburger. */}
        <div className="flex shrink-0 items-center gap-2 nav:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="student-nav-mobile"
            aria-label={menuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            className="grid size-8 cursor-pointer place-items-center rounded-lg border border-ln text-fg3"
          >
            {menuOpen ? <FaXmark className="size-3.5" /> : <FaBars className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel — max-w-full tránh tràn khi mở menu. */}
      {menuOpen && (
        <nav
          id="student-nav-mobile"
          aria-label="Điều hướng chính"
          className="max-w-full border-t border-ln bg-bg shadow-hd nav:hidden"
        >
          <div className="mx-auto flex w-full min-w-0 max-w-content flex-col gap-0.5 px-4 py-3 sm:px-6">
            {navLinks}
            <div className="mt-2 border-t border-ln pt-3">
              {user ? (
                <div className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5">
                  <UserMenu name={user.name} initials={user.initials} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{user.name}</p>
                    <p className="text-xs text-fg3">Tài khoản của bạn</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    showLogin({ callbackURL: pathname });
                  }}
                  className="w-full cursor-pointer rounded-lg bg-(image:--g) px-3.5 py-2.5 text-sm font-semibold text-on-g transition duration-200 hover:brightness-110"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
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
      onClick={signalNavigationStart}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm nav:py-2',
        // Mobile panel: cho phép xuống dòng nếu tên dài; desktop nav: một hàng + scroll.
        'max-nav:whitespace-normal nav:whitespace-nowrap',
        'transition-colors duration-150',
        active ? 'font-semibold text-acc-hi' : 'text-fg2 hover:text-fg',
      )}
    >
      <NavLinkPending active={active} />
      <Icon className={cn('relative size-3.5 shrink-0', active ? 'opacity-100' : 'opacity-80')} />
      <span className="relative min-w-0">{label}</span>
      {children && <span className="relative shrink-0">{children}</span>}
    </Link>
  );
}

/** Phải là con của <Link> — đọc pending từ context của đúng link đang chuyển. */
function NavLinkPending({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-0 rounded-lg bg-(image:--g-soft) transition-opacity duration-200',
        pending || active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        pending && 'animate-pulse',
      )}
    />
  );
}
