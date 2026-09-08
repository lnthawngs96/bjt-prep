'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Tự tắt nếu điều hướng treo — tránh thanh progress kẹt mãi. */
const SAFETY_MS = 8_000;

/**
 * Thanh progress mỏng trên cùng viewport khi đang chuyển trang App Router.
 * SSR/RSC chưa về thì URL và UI cũ vẫn giữ — thanh này báo rằng click đã nhận.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const activeRef = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  function clearTimers() {
    if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
    if (safetyTimer.current != null) window.clearTimeout(safetyTimer.current);
    hideTimer.current = null;
    safetyTimer.current = null;
  }

  function start() {
    clearTimers();
    activeRef.current = true;
    setComplete(false);
    setActive(true);
    safetyTimer.current = window.setTimeout(() => {
      activeRef.current = false;
      setActive(false);
      setComplete(false);
    }, SAFETY_MS);
  }

  function finish() {
    if (!activeRef.current) return;
    clearTimers();
    setComplete(true);
    hideTimer.current = window.setTimeout(() => {
      activeRef.current = false;
      setActive(false);
      setComplete(false);
    }, 220);
  }

  useEffect(() => {
    finish();
    // routeKey đổi = payload trang mới đã gắn — kết thúc thanh progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý chỉ theo dõi route
  }, [routeKey]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.('a');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
      clearTimers();
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={complete ? 100 : active ? 40 : 0}
      aria-label="Đang chuyển trang"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5',
        active ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-150',
      )}
    >
      <div
        className={cn(
          'h-full origin-left bg-(image:--g) shadow-btn-xs transition-[width,transform] duration-300 ease-smooth',
          complete ? 'w-full' : active ? 'w-3/4 animate-nav-indeterminate' : 'w-0',
        )}
      />
    </div>
  );
}
