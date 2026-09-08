'use client';

import { useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminCheckbox } from './form/AdminCheckbox';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import { ADMIN_LEVELS, ADMIN_REGISTER_LABELS, ADMIN_STATUS_LABELS, levelLabel } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminGrammarPoint, handlePatchAdminGrammarPoint, handlePostAdminGrammar } from '@/services/api/admin/vocabularyApi';
import type { AdminGrammarRow } from '@/lib/data/types';
import type { GrammarInput } from '@/lib/validation/admin/grammar';
import type { Level, Register } from '@/lib/prisma-types';

const LEVEL_LABELS = Object.fromEntries(ADMIN_LEVELS.map((l) => [l, levelLabel(l)])) as Record<Level, string>;

function empty(): GrammarInput {
  return { slug: '', pattern: '', formation: '', meaningVi: '', register: 'TEINEIGO', level: 'J3', usageNoteVi: null, commonMistakeVi: null, jlptLevel: null, status: 'DRAFT', examples: [] };
}
function toInput(g: AdminGrammarRow): GrammarInput {
  return {
    slug: g.slug, pattern: g.pattern, formation: g.formation, meaningVi: g.meaningVi, register: g.register, level: g.level,
    usageNoteVi: g.usageNoteVi, commonMistakeVi: g.commonMistakeVi, jlptLevel: g.jlptLevel, status: g.status,
    examples: g.examples.map((e) => ({ sentenceJa: e.sentenceJa, meaningVi: e.meaningVi, contextTag: e.contextTag, isNegative: e.isNegative, noteVi: e.noteVi, audioId: e.audioId })),
  };
}

type Editing = { id: string | null; value: GrammarInput };

export function AdminGrammarList({ rows }: { rows: AdminGrammarRow[] }) {
  const [register, setRegister] = useState<Register | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);

  const create = useAdminMutation(handlePostAdminGrammar, { successMessage: 'Đã thêm mẫu', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminGrammarPoint, { successMessage: 'Đã lưu mẫu', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminGrammarPoint, { successMessage: 'Đã xoá mẫu', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (register === 'ALL' || r.register === register) && (!q || r.pattern.includes(q) || r.meaningVi.toLowerCase().includes(q) || r.slug.includes(q)));

  const v = editing?.value;
  const set = <K extends keyof GrammarInput>(k: K, val: GrammarInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });
  const patchEx = (i: number, p: Partial<GrammarInput['examples'][number]>) => v && set('examples', v.examples.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo mẫu, nghĩa hoặc slug…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: register === 'ALL', onClick: () => setRegister('ALL') },
          ...(Object.keys(ADMIN_REGISTER_LABELS) as Register[]).map((r) => ({ id: r, label: ADMIN_REGISTER_LABELS[r].split(' · ')[0], pressed: register === r, onClick: () => setRegister(r) })),
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm mẫu
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có mẫu ngữ pháp nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toInput(r) })}
            leading={<span className="tnum">{levelLabel(r.level)}</span>}
            title={<span className="jp text-base font-semibold">{r.pattern}</span>}
            subtitle={`${r.meaningVi} · ${ADMIN_REGISTER_LABELS[r.register]}`}
            columns={<span className="tnum w-14">{r.examples.length} ví dụ</span>}
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa mẫu ngữ pháp' : 'Thêm mẫu ngữ pháp'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Mẫu">
              <AdminFormRow>
                <Field label="Mẫu (〜させていただく)" className="[&_input]:jp" value={v.pattern} onChange={(e) => set('pattern', e.target.value)} error={errors.pattern} />
                <Field label="Slug (URL)" placeholder="sasete-itadaku" value={v.slug} onChange={(e) => set('slug', e.target.value)} error={errors.slug} />
              </AdminFormRow>
              <Field label="Cách ghép (V使役形 + ていただく)" className="[&_input]:jp" value={v.formation} onChange={(e) => set('formation', e.target.value)} error={errors.formation} />
              <Field label="Nghĩa tiếng Việt" value={v.meaningVi} onChange={(e) => set('meaningVi', e.target.value)} error={errors.meaningVi} />
              <AdminFormRow className="sm:grid-cols-4">
                <AdminEnumSelect label="Tầng lịch sự" options={ADMIN_REGISTER_LABELS} value={v.register} onValue={(x) => x && set('register', x)} />
                <AdminEnumSelect label="Bậc" options={LEVEL_LABELS} order={ADMIN_LEVELS} value={v.level} onValue={(x) => x && set('level', x)} />
                <Field label="JLPT" placeholder="N2" value={v.jlptLevel ?? ''} onChange={(e) => set('jlptLevel', e.target.value || null)} />
                <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={v.status} onValue={(x) => x && set('status', x)} />
              </AdminFormRow>
              <TextareaField label="Dùng khi nào" rows={3} value={v.usageNoteVi ?? ''} onChange={(e) => set('usageNoteVi', e.target.value || null)} />
              <TextareaField label="Lỗi người Việt hay mắc" rows={3} value={v.commonMistakeVi ?? ''} onChange={(e) => set('commonMistakeVi', e.target.value || null)} />
            </AdminFormSection>

            <AdminFormSection title="Ví dụ" hint="Đánh dấu ví dụ SAI để hiện cạnh ví dụ đúng — học kính ngữ mà không thấy ví dụ sai thì khó nhớ.">
              {v.examples.map((e, i) => (
                <div key={i} className={e.isNegative ? 'border-l-2 border-ng pl-3' : 'border-l-2 border-ln pl-3'}>
                  <div className="mb-2 flex items-start gap-2">
                    <TextareaField label={`Câu ${i + 1}`} rows={2} className="flex-1 [&_textarea]:jp" value={e.sentenceJa} onChange={(ev) => patchEx(i, { sentenceJa: ev.target.value })} error={errors[`examples.${i}.sentenceJa`]} />
                    <button type="button" aria-label="Bỏ ví dụ" onClick={() => set('examples', v.examples.filter((_, j) => j !== i))} className="cursor-pointer mt-6 grid size-8 place-items-center rounded-md text-fg3 hover:bg-ng-soft hover:text-ng">
                      <FaXmark className="size-3" />
                    </button>
                  </div>
                  <Field label="Nghĩa" value={e.meaningVi} onChange={(ev) => patchEx(i, { meaningVi: ev.target.value })} error={errors[`examples.${i}.meaningVi`]} />
                  <AdminFormRow className="mt-2">
                    <Field label="Bối cảnh" value={e.contextTag ?? ''} onChange={(ev) => patchEx(i, { contextTag: ev.target.value || null })} />
                    <Field label="Ghi chú (vì sao sai / đúng)" value={e.noteVi ?? ''} onChange={(ev) => patchEx(i, { noteVi: ev.target.value || null })} />
                  </AdminFormRow>
                  <AdminCheckbox className="mt-2" label="Đây là ví dụ dùng SAI" checked={e.isNegative} onChange={(ev) => patchEx(i, { isNegative: ev.target.checked })} />
                </div>
              ))}
              <Button type="button" size="sm" className="self-start" onClick={() => set('examples', [...v.examples, { sentenceJa: '', meaningVi: '', contextTag: null, isNegative: false, noteVi: null, audioId: null }])}>
                <FaPlus className="size-3" /> Thêm ví dụ
              </Button>
            </AdminFormSection>
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
