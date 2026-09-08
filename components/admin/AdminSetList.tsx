'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import { AdminOrderedPicker } from './form/AdminOrderedPicker';
import { ADMIN_LEVELS, ADMIN_SECTION_SHORT, ADMIN_STATUS_LABELS, levelLabel } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminSet, handlePatchAdminSet, handlePostAdminSets } from '@/services/api/admin/setsApi';
import type { AdminLookups, AdminSetRow } from '@/lib/data/types';
import type { SetInput } from '@/lib/validation/admin/set';
import type { Level, SectionCode } from '@/lib/prisma-types';

const LEVEL_LABELS = Object.fromEntries(ADMIN_LEVELS.map((l) => [l, levelLabel(l)])) as Record<Level, string>;

function empty(): SetInput {
  return { sectionCode: 'LR2', level: 'J3', indexNo: 1, titleVi: '', descVi: null, estMinutes: 10, status: 'DRAFT', items: [] };
}
function toInput(s: AdminSetRow): SetInput {
  return { sectionCode: s.sectionCode, level: s.level, indexNo: s.indexNo, titleVi: s.titleVi, descVi: s.descVi, estMinutes: s.estMinutes, status: s.status, items: s.items };
}

type Editing = { id: string | null; value: SetInput };

export function AdminSetList({ rows, lookups }: { rows: AdminSetRow[]; lookups: AdminLookups }) {
  const [section, setSection] = useState<SectionCode | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);

  const create = useAdminMutation(handlePostAdminSets, { successMessage: 'Đã thêm bộ', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminSet, { successMessage: 'Đã lưu bộ', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminSet, { successMessage: 'Đã xoá bộ', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (section === 'ALL' || r.sectionCode === section) && (!q || r.titleVi.toLowerCase().includes(q)));
  const sectionLabels = Object.fromEntries(lookups.sections.map((s) => [s.code, `${ADMIN_SECTION_SHORT[s.code]} · ${s.nameJa}`])) as Record<SectionCode, string>;

  const v = editing?.value;
  const set = <K extends keyof SetInput>(k: K, val: SetInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });
  // Bộ luyện tập là "luyện một section": kho chọn chỉ có group cùng section.
  const pool = lookups.groups.filter((g) => g.sectionCode === v?.sectionCode).map((g) => ({ id: g.id, label: g.titleAdmin, hint: `${levelLabel(g.level)} · ${g.questionCount} câu` }));
  const chosenCount = v ? v.items.reduce((n, i) => n + (lookups.groups.find((g) => g.id === i.groupId)?.questionCount ?? 0), 0) : 0;

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên bộ…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: section === 'ALL', onClick: () => setSection('ALL') },
          ...lookups.sections.map((s) => ({ id: s.code, label: <span className="jp">{ADMIN_SECTION_SHORT[s.code]}</span>, pressed: section === s.code, onClick: () => setSection(s.code) })),
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm bộ
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có bộ nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toInput(r) })}
            leading={<span className="jp">{ADMIN_SECTION_SHORT[r.sectionCode]}</span>}
            title={`Bộ ${r.indexNo} — ${r.titleVi}`}
            subtitle={r.descVi ?? undefined}
            columns={
              <>
                <span className="tnum w-8">{levelLabel(r.level)}</span>
                <span className="tnum w-14">{r.questionCount} câu</span>
                <span className="tnum w-14">{r.estMinutes ?? '—'} phút</span>
              </>
            }
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa bộ luyện tập' : 'Thêm bộ luyện tập'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Bộ luyện tập">
              <AdminFormRow className="sm:grid-cols-3">
                <AdminEnumSelect label="Section" options={sectionLabels} order={lookups.sections.map((s) => s.code)} value={v.sectionCode} onValue={(x) => x && set('sectionCode', x)} />
                <Field label="Số bộ" type="number" min={1} hint="Duy nhất trong section." value={v.indexNo} onChange={(e) => set('indexNo', Number(e.target.value))} error={errors.indexNo} />
                <AdminEnumSelect label="Bậc" options={LEVEL_LABELS} order={ADMIN_LEVELS} value={v.level} onValue={(x) => x && set('level', x)} />
              </AdminFormRow>
              <Field label="Tên bộ (tiếng Việt)" value={v.titleVi} onChange={(e) => set('titleVi', e.target.value)} error={errors.titleVi} />
              <TextareaField label="Mô tả" rows={2} value={v.descVi ?? ''} onChange={(e) => set('descVi', e.target.value || null)} />
              <AdminFormRow>
                <Field label="Thời gian làm (phút)" type="number" min={1} hint="Đồng hồ của màn thi luyện tập." value={v.estMinutes ?? ''} onChange={(e) => set('estMinutes', e.target.value === '' ? null : Number(e.target.value))} />
                <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={v.status} onValue={(x) => x && set('status', x)} />
              </AdminFormRow>
            </AdminFormSection>
            <AdminFormSection title={`Nhóm câu — ${chosenCount} câu`} hint="Chỉ chọn được nhóm cùng section. Đổi section thì chọn lại.">
              <AdminOrderedPicker
                label="Nhóm câu"
                pool={pool}
                value={[...v.items].sort((a, b) => a.order - b.order).map((i) => i.groupId)}
                onChange={(ids) => set('items', ids.map((groupId, i) => ({ groupId, order: i + 1 })))}
                error={errors.items}
              />
            </AdminFormSection>
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
