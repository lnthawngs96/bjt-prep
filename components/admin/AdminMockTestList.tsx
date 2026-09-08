'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminFormSection } from './form/AdminFormSection';
import { AdminOrderedPicker } from './form/AdminOrderedPicker';
import { ADMIN_SECTION_SHORT, levelLabel } from '@/constants/admin/adminLabels';
import { validateMockTestComposition } from '@/lib/exam-rules';
import { MOCK_TEST_QUESTION_COUNT } from '@/lib/scoring';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import {
  handleDeleteAdminMockTest,
  handlePatchAdminMockTest,
  handlePostAdminMockTestPublish,
  handlePostAdminMockTestUnpublish,
  handlePostAdminMockTests,
} from '@/services/api/admin/setsApi';
import type { AdminLookups, AdminMockTestRow } from '@/lib/data/types';
import type { MockTestInput } from '@/lib/validation/admin/mockTest';
import type { SectionCode } from '@/lib/prisma-types';
import { cn } from '@/lib/utils';

function empty(): MockTestInput {
  return { code: '', titleVi: '', descVi: null, items: [] };
}
function toInput(t: AdminMockTestRow): MockTestInput {
  return { code: t.code, titleVi: t.titleVi, descVi: t.descVi, items: t.items };
}

type Editing = { id: string | null; status: AdminMockTestRow['status'] | null; value: MockTestInput };

export function AdminMockTestList({ rows, lookups }: { rows: AdminMockTestRow[]; lookups: AdminLookups }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);

  const create = useAdminMutation(handlePostAdminMockTests, { successMessage: 'Đã thêm đề', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminMockTest, { successMessage: 'Đã lưu đề (về trạng thái Đang soạn)', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminMockTest, { successMessage: 'Đã xoá đề', onSuccess: () => setEditing(null) });
  const publish = useAdminMutation(handlePostAdminMockTestPublish, { successMessage: 'Đã xuất bản đề', onSuccess: () => setEditing(null) });
  const unpublish = useAdminMutation(handlePostAdminMockTestUnpublish, { successMessage: 'Đã gỡ đề', onSuccess: () => setEditing(null) });
  const errors = { ...(editing?.id ? update.fieldErrors : create.fieldErrors), ...publish.fieldErrors };

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => !q || r.titleVi.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));

  const v = editing?.value;
  const set = <K extends keyof MockTestInput>(k: K, val: MockTestInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });
  const groupById = new Map(lookups.groups.map((g) => [g.id, g]));

  // Bộ đếm theo section tính ngay khi lắp — khớp với kiểm tra ở server lúc publish.
  const counts: Partial<Record<SectionCode, number>> = {};
  for (const i of v?.items ?? []) {
    const g = groupById.get(i.groupId);
    if (g && g.status === 'PUBLISHED') counts[g.sectionCode] = (counts[g.sectionCode] ?? 0) + g.questionCount;
  }
  const check = validateMockTestComposition(counts, lookups.sections);
  const total = Object.values(counts).reduce((n, c) => n + c, 0);

  return (
    <>
      <AdminFilterBar search={search} onSearch={setSearch} placeholder="Tìm theo tên hoặc mã đề…" chips={[]}>
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, status: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm đề
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có đề nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, status: r.status, value: toInput(r) })}
            leading={<span className="tnum">{r.code}</span>}
            title={r.titleVi}
            subtitle={r.descVi ?? undefined}
            columns={<span className={cn('tnum w-20', r.questionCount === MOCK_TEST_QUESTION_COUNT ? 'text-ok' : 'text-wr')}>{r.questionCount}/{MOCK_TEST_QUESTION_COUNT} câu</span>}
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa đề thi thử' : 'Thêm đề thi thử'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving || publish.saving || unpublish.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
        extraActions={
          editing?.id &&
          (editing.status === 'PUBLISHED' ? (
            <Button variant="outline" onClick={() => void unpublish.run(editing.id!)}>
              Gỡ xuất bản
            </Button>
          ) : (
            <Button variant="outline" disabled={!check.ok} title={check.ok ? undefined : 'Chưa đủ 80 câu đúng phân bổ'} onClick={() => void publish.run(editing.id!)}>
              Xuất bản
            </Button>
          ))
        }
      >
        {v && (
          <>
            <AdminFormSection title="Đề thi thử" hint="Sửa thành phần thì đề tự về Đang soạn; bấm Xuất bản sau khi lưu.">
              <Field label="Mã đề" placeholder="MT-04" value={v.code} onChange={(e) => set('code', e.target.value.toUpperCase())} error={errors.code} />
              <Field label="Tên đề" value={v.titleVi} onChange={(e) => set('titleVi', e.target.value)} error={errors.titleVi} />
              <TextareaField label="Mô tả" rows={2} value={v.descVi ?? ''} onChange={(e) => set('descVi', e.target.value || null)} />
            </AdminFormSection>

            <AdminFormSection title={`Cấu trúc — ${total}/${MOCK_TEST_QUESTION_COUNT} câu`} hint="Chỉ tính câu đã duyệt trong nhóm đã duyệt. Publish bị khoá đến khi từng section đủ số câu.">
              <ul className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                {lookups.sections.map((s) => {
                  const have = counts[s.code] ?? 0;
                  const ok = have === s.questionCount;
                  return (
                    <li key={s.code} className="flex items-center justify-between border-b border-ln py-1">
                      <span className="jp">{ADMIN_SECTION_SHORT[s.code]}</span>
                      <span className={cn('tnum font-semibold', ok ? 'text-ok' : 'text-wr')}>{have}/{s.questionCount}</span>
                    </li>
                  );
                })}
              </ul>
              {!check.ok && v.items.length > 0 && (
                <p className="text-xs text-wr">
                  Thiếu hoặc thừa: {check.missing.map((m) => `${m.code} ${m.have}/${m.need}`).join(' · ')}
                </p>
              )}
              {check.ok && <Badge tone="ok">Đủ 80 câu, đúng phân bổ</Badge>}
              {errors.items && <p role="alert" className="text-xs text-ng">{errors.items}</p>}
            </AdminFormSection>

            <AdminFormSection title="Nhóm câu" hint="Thứ tự trong đề. Màn thi tự gom theo phần và section.">
              <AdminOrderedPicker
                label="Nhóm câu"
                pool={lookups.groups.map((g) => ({ id: g.id, label: g.titleAdmin, hint: `${ADMIN_SECTION_SHORT[g.sectionCode]} · ${levelLabel(g.level)} · ${g.questionCount} câu` }))}
                value={[...v.items].sort((a, b) => a.order - b.order).map((i) => i.groupId)}
                onChange={(ids) => set('items', ids.map((groupId, i) => ({ groupId, sectionCode: groupById.get(groupId)?.sectionCode ?? 'L1', order: i + 1 })))}
              />
            </AdminFormSection>
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
