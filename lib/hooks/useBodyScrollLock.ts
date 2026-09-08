'use client';

import { useEffect } from 'react';

/**
 * Khoá cuộn nền khi có dialog mở.
 *
 * Dùng BỘ ĐẾM chứ không phải "lưu giá trị cũ rồi khôi phục". Cách lưu-khôi-phục
 * hỏng khi có hai lớp chồng nhau: dialog thứ hai mở lúc body đã `hidden` sẽ lưu
 * nhầm `hidden` làm giá trị gốc, và khi đóng thì khôi phục lại chính `hidden`
 * — nền kẹt không cuộn được nữa. Lỗi này đã xảy ra thật với Modal + Drawer.
 */
let lockCount = 0;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) document.body.style.overflow = 'hidden';

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.removeProperty('overflow');
    };
  }, [active]);
}
