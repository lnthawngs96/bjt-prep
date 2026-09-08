'use client';

import { create } from 'zustand';

interface AuthDialog {
  open: boolean;
  /** Quay lại đúng trang này sau khi đăng nhập xong. */
  callbackURL: string | null;
  /** Một dòng giải thích vì sao đang cần đăng nhập. */
  reason: string | null;
  show: (opts?: { callbackURL?: string; reason?: string }) => void;
  hide: () => void;
}

/**
 * Mở dialog đăng nhập từ BẤT KỲ chỗ nào trong app.
 *
 * Bấm vào tính năng cần đăng nhập thì mở dialog TẠI CHỖ, không điều hướng
 * sang trang khác — người dùng đang xem dở /practice thì phải quay lại đúng đó.
 */
export const useAuthDialog = create<AuthDialog>((set) => ({
  open: false,
  callbackURL: null,
  reason: null,
  show: (opts) =>
    set({
      open: true,
      callbackURL: opts?.callbackURL ?? null,
      reason: opts?.reason ?? null,
    }),
  hide: () => set({ open: false }),
}));
