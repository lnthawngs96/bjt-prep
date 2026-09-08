'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';

/**
 * Drawer sửa một bản ghi: form ở giữa, đáy có Lưu · Huỷ · Xoá.
 * Xoá phải qua hộp xác nhận — admin lúc 2 giờ sáng bấm nhầm là chuyện thường.
 */
export function AdminEntityDrawer({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  saving,
  onDelete,
  deleteLabel = 'Xoá',
  extraActions,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
  /** Không truyền thì không có nút Xoá (bản ghi mới). */
  onDelete?: () => void;
  deleteLabel?: string;
  extraActions?: ReactNode;
  children: ReactNode;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        footer={
          <>
            <Button variant="gradient" onClick={onSubmit} loading={saving}>
              Lưu
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Huỷ
            </Button>
            {extraActions}
            {onDelete && (
              <Button variant="danger" className="ml-auto" onClick={() => setConfirm(true)} disabled={saving}>
                {deleteLabel}
              </Button>
            )}
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
        </form>
      </Drawer>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Xác nhận xoá">
        <div className="p-6">
          <p className="mb-2 text-base font-medium">Xoá bản ghi này?</p>
          <p className="mb-6 text-sm text-fg2">
            Không hoàn tác được. Bản ghi đang được dùng ở nơi khác sẽ không xoá được — khi đó chuyển sang
            Lưu trữ.
          </p>
          <div className="flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Giữ lại
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirm(false);
                onDelete?.();
              }}
            >
              Xoá
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
