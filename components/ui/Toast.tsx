'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaTriangleExclamation } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'ng' | 'wr' | 'info';

interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

/** Gọi ở bất kỳ client component nào: const toast = useToast(); toast('Đã lưu'); */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải nằm trong <ToastProvider>');
  return ctx;
}

const ICONS: Record<Tone, typeof FaCircleCheck> = {
  ok: FaCircleCheck,
  ng: FaCircleExclamation,
  wr: FaTriangleExclamation,
  info: FaCircleInfo,
};

const TONES: Record<Tone, string> = {
  ok: 'text-ok',
  ng: 'text-ng',
  wr: 'text-wr',
  info: 'text-acc',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Tone = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, tone, message }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* role="status" + aria-live polite: đọc lên nhưng không cắt ngang người dùng. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2"
      >
        {items.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 rounded-[9px] border border-ln',
                'bg-bg px-3.5 py-2.5 text-[12.5px] text-fg shadow-soft',
                'motion-safe:animate-[dialog-rise_.24s_ease]',
              )}
            >
              <Icon aria-hidden className={cn('size-3.5 flex-none', TONES[t.tone])} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
