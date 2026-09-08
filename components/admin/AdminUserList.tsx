'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { ADMIN_ROLE_LABELS } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handlePatchAdminUser } from '@/services/api/admin/usersApi';
import type { AdminUserRow } from '@/lib/data/types';
import type { UserRole } from '@/lib/prisma-types';

export function AdminUserList({ rows, meId }: { rows: AdminUserRow[]; meId: string }) {
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const change = useAdminMutation(handlePatchAdminUser, { successMessage: 'Đã đổi vai trò' });

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (role === 'ALL' || r.role === role) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)));

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên hoặc email…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: role === 'ALL', onClick: () => setRole('ALL') },
          ...(Object.keys(ADMIN_ROLE_LABELS) as UserRole[]).map((r) => ({ id: r, label: ADMIN_ROLE_LABELS[r], pressed: role === r, onClick: () => setRole(r) })),
        ]}
      />
      {visible.length === 0 ? (
        <AdminEmpty>Không có người dùng nào khớp.</AdminEmpty>
      ) : (
        visible.map((u) => (
          <AdminListRow
            key={u.id}
            title={
              <>
                {u.name} {u.id === meId && <span className="ml-1 text-xs text-acc-hi">· bạn</span>}
                {u.banned && <Badge tone="ng" className="ml-2">Bị khoá</Badge>}
              </>
            }
            subtitle={u.email}
            columns={
              <>
                <span className="tnum w-16">{u.attemptCount} lượt</span>
                <span className="tnum w-24">{u.createdAt.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span>
              </>
            }
            trailing={
              <AdminEnumSelect
                label="Vai trò"
                className="w-36 [&_label]:sr-only"
                options={ADMIN_ROLE_LABELS}
                value={u.role}
                disabled={change.saving}
                onValue={(r) => r && r !== u.role && void change.run(u.id, { role: r })}
              />
            }
          />
        ))
      )}
      <p className="mt-4 text-xs text-fg3">Không tự bỏ quyền admin của chính mình được. Vai trò mới có hiệu lực ở lần tải trang kế của người đó.</p>
    </>
  );
}
