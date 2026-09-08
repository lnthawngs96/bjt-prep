'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Tự tắt nếu điều hướng treo — tránh overlay kẹt mãi. */
const SAFETY_MS = 8_000;

const NAV_START = 'bjt:nav-start';

/** Gọi từ Link/header khi bắt đầu chuyển trang (bổ sung cho listener toàn cục). */
export function signalNavigationStart() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(NAV_START));
}

/**
 * Overlay spinner toàn màn khi đang chuyển trang App Router.
 * Chặn thao tác trên trang cũ cho đến khi route mới gắn xong.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const safetyTimer = useRef<number | null>(null);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  function clearTimers() {
    if (safetyTimer.current != null) window.clearTimeout(safetyTimer.current);
    safetyTimer.current = null;
  }

  function start() {
    clearTimers();
    activeRef.current = true;
    setActive(true);
    safetyTimer.current = window.setTimeout(() => {
      activeRef.current = false;
      setActive(false);
    }, SAFETY_MS);
  }

  function finish() {
    if (!activeRef.current) return;
    clearTimers();
    activeRef.current = false;
    setActive(false);
  }

  useEffect(() => {
    finish();
    // routeKey đổi = payload trang mới đã gắn — tắt overlay.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý chỉ theo dõi route
  }, [routeKey]);

  useEffect(() => {
    function onNavStart() {
      start();
    }

    function onClick(e: MouseEvent) {
      // Không đọc defaultPrevented: Next <Link> gọi preventDefault trước khi bubble.
      if (e.button !== 0) return;
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

    // Capture: chạy trước handler của <Link>, vì Link preventDefault ở bubble.
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    window.addEventListener(NAV_START, onNavStart);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(NAV_START, onNavStart);
      clearTimers();
    };
  }, []);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang chuyển trang"
      className={cn(
        'fixed inset-0 z-100 grid place-items-center',
        'cursor-wait bg-(--ov) backdrop-blur-sm',
      )}
    >
      <span
        aria-hidden
        className="size-8 animate-spin rounded-full border-2 border-ln border-t-acc motion-reduce:animate-none"
      />
    </div>
  );
}
