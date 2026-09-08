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
import {
  ADMIN_KIND_LABELS,
  ADMIN_LEVELS,
  ADMIN_SECTION_SHORT,
  ADMIN_STATUS_LABELS,
  levelLabel,
} from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminGroup, handlePatchAdminGroup, handlePostAdminGroups } from '@/services/api/admin/groupsApi';
import type { AdminGroupRow, AdminLookups } from '@/lib/data/types';
import type { GroupInput } from '@/lib/validation/admin/group';
import type { Level, SectionCode } from '@/lib/prisma-types';

const LEVEL_LABELS = Object.fromEntries(ADMIN_LEVELS.map((l) => [l, levelLabel(l)])) as Record<Level, string>;

function empty(): GroupInput {
  return { sectionCode: 'LR2', level: 'J3', titleAdmin: '', instructionJa: null, instructionVi: null, status: 'DRAFT', materials: [] };
}
function toInput(g: AdminGroupRow): GroupInput {
  return {
    sectionCode: g.sectionCode,
    level: g.level,
    titleAdmin: g.titleAdmin,
    instructionJa: g.instructionJa,
    instructionVi: g.instructionVi,
    status: g.status,
    materials: g.materials.map((m) => ({ materialId: m.materialId, order: m.order })),
  };
}

type Editing = { id: string | null; value: GroupInput };

export function AdminGroupList({ rows, lookups }: { rows: AdminGroupRow[]; lookups: AdminLookups }) {
  const [section, setSection] = useState<SectionCode | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);

  const create = useAdminMutation(handlePostAdminGroups, { successMessage: 'Đã thêm nhóm', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminGroup, { successMessage: 'Đã lưu nhóm', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminGroup, { successMessage: 'Đã xoá nhóm', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (section === 'ALL' || r.sectionCode === section) && (!q || r.titleAdmin.toLowerCase().includes(q)));
  const sectionLabels = Object.fromEntries(lookups.sections.map((s) => [s.code, `${ADMIN_SECTION_SHORT[s.code]} · ${s.nameJa}`])) as Record<SectionCode, string>;

  const v = editing?.value;
  const set = <K extends keyof GroupInput>(k: K, val: GroupInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên nhóm…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: section === 'ALL', onClick: () => setSection('ALL') },
          ...lookups.sections.map((s) => ({ id: s.code, label: <span className="jp">{ADMIN_SECTION_SHORT[s.code]}</span>, pressed: section === s.code, onClick: () => setSection(s.code) })),
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm nhóm
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có nhóm nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toInput(r) })}
            leading={<span className="jp">{ADMIN_SECTION_SHORT[r.sectionCode]}</span>}
            title={<span className="jp font-normal">{r.titleAdmin}</span>}
            subtitle={r.materials.length ? r.materials.map((m) => ADMIN_KIND_LABELS[m.kind]).join(' + ') : 'Không có tài liệu'}
            columns={
              <>
                <span className="tnum w-8">{levelLabel(r.level)}</span>
                <span className="tnum w-14">{r.questionCount} câu</span>
              </>
            }
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa nhóm câu' : 'Thêm nhóm câu'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Nhóm câu (大問)">
              <Field label="Tên nội bộ" hint="Không hiện cho học viên." value={v.titleAdmin} onChange={(e) => set('titleAdmin', e.target.value)} error={errors.titleAdmin} />
              <AdminFormRow className="sm:grid-cols-3">
                <AdminEnumSelect label="Section" options={sectionLabels} order={lookups.sections.map((s) => s.code)} value={v.sectionCode} onValue={(x) => x && set('sectionCode', x)} />
                <AdminEnumSelect label="Bậc" options={LEVEL_LABELS} order={ADMIN_LEVELS} value={v.level} onValue={(x) => x && set('level', x)} />
                <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={v.status} onValue={(x) => x && set('status', x)} />
              </AdminFormRow>
              <TextareaField label="Hướng dẫn (tiếng Nhật)" rows={2} className="[&_textarea]:jp" value={v.instructionJa ?? ''} onChange={(e) => set('instructionJa', e.target.value || null)} />
              <TextareaField label="Hướng dẫn (tiếng Việt)" rows={2} value={v.instructionVi ?? ''} onChange={(e) => set('instructionVi', e.target.value || null)} />
            </AdminFormSection>
            <AdminFormSection title="Tài liệu" hint="Theo thứ tự hiển thị: thường audio trước, bảng hoặc ảnh sau.">
              <AdminOrderedPicker
                label="Tài liệu"
                pool={lookups.materials.map((m) => ({ id: m.id, label: m.titleAdmin, hint: ADMIN_KIND_LABELS[m.kind] }))}
                value={[...v.materials].sort((a, b) => a.order - b.order).map((m) => m.materialId)}
                onChange={(ids) => set('materials', ids.map((materialId, i) => ({ materialId, order: i + 1 })))}
                error={errors.materials}
              />
            </AdminFormSection>
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
