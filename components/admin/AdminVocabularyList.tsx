'use client';

import { useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import {
  ADMIN_LEVELS,
  ADMIN_POS_LABELS,
  ADMIN_REGISTER_LABELS,
  ADMIN_RELATION_LABELS,
  ADMIN_STATUS_LABELS,
  levelLabel,
} from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminVocabularyEntry, handlePatchAdminVocabularyEntry, handlePostAdminVocabulary } from '@/services/api/admin/vocabularyApi';
import { VOCAB_RELATIONS, type VocabInput } from '@/lib/validation/admin/vocab';
import type { AdminLookups, AdminVocabRow } from '@/lib/data/types';
import type { Level } from '@/lib/prisma-types';

const LEVEL_LABELS = Object.fromEntries(ADMIN_LEVELS.map((l) => [l, levelLabel(l)])) as Record<Level, string>;

function empty(): VocabInput {
  return {
    headword: '', readingKana: '', accent: null, pos: 'NOUN', meaningVi: '', meaningEn: null, level: 'J3',
    topicId: null, register: null, audioId: null, noteVi: null, status: 'DRAFT', examples: [], relations: [],
  };
}
function toInput(v: AdminVocabRow): VocabInput {
  return {
    headword: v.headword, readingKana: v.readingKana, accent: v.accent, pos: v.pos, meaningVi: v.meaningVi,
    meaningEn: v.meaningEn, level: v.level, topicId: v.topicId, register: v.register, audioId: v.audioId,
    noteVi: v.noteVi, status: v.status,
    examples: v.examples.map((e) => ({ sentenceJa: e.sentenceJa, sentenceKana: e.sentenceKana, meaningVi: e.meaningVi, contextTag: e.contextTag, audioId: e.audioId })),
    relations: v.relations.map((r) => ({ relatedId: r.relatedId, relation: r.relation as VocabInput['relations'][number]['relation'] })),
  };
}

type Editing = { id: string | null; value: VocabInput };

export function AdminVocabularyList({ rows, lookups }: { rows: AdminVocabRow[]; lookups: AdminLookups }) {
  const [topic, setTopic] = useState<string | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [relPick, setRelPick] = useState({ id: '', relation: 'sonkeigo' as VocabInput['relations'][number]['relation'] });

  const create = useAdminMutation(handlePostAdminVocabulary, { successMessage: 'Đã thêm từ', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminVocabularyEntry, { successMessage: 'Đã lưu từ', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminVocabularyEntry, { successMessage: 'Đã xoá từ', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (topic === 'ALL' || r.topicId === topic) && (!q || r.headword.includes(q) || r.readingKana.includes(q) || r.meaningVi.toLowerCase().includes(q)));
  const topicName = new Map(lookups.topics.map((t) => [t.id, t.nameVi]));

  const v = editing?.value;
  const set = <K extends keyof VocabInput>(k: K, val: VocabInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });
  const vocabName = new Map(lookups.vocab.map((x) => [x.id, x.headword]));

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo từ, kana hoặc nghĩa…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: topic === 'ALL', onClick: () => setTopic('ALL') },
          ...lookups.topics.map((t) => ({ id: t.id, label: t.nameVi, pressed: topic === t.id, onClick: () => setTopic(t.id) })),
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm từ
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có từ nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toInput(r) })}
            leading={<span className="tnum">{levelLabel(r.level)}</span>}
            title={<span className="jp text-base font-semibold">{r.headword} <span className="text-xs font-normal text-fg3">{r.readingKana}</span></span>}
            subtitle={`${r.meaningVi}${r.topicId ? ` · ${topicName.get(r.topicId) ?? ''}` : ''}${r.register ? ` · ${ADMIN_REGISTER_LABELS[r.register]}` : ''}`}
            columns={<span className="tnum w-14">{r.examples.length} ví dụ</span>}
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa từ vựng' : 'Thêm từ vựng'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Từ">
              <AdminFormRow>
                <Field label="Từ (漢字/かな)" className="[&_input]:jp" value={v.headword} onChange={(e) => set('headword', e.target.value)} error={errors.headword} />
                <Field label="Cách đọc (かな)" className="[&_input]:jp" value={v.readingKana} onChange={(e) => set('readingKana', e.target.value)} error={errors.readingKana} />
              </AdminFormRow>
              <AdminFormRow className="sm:grid-cols-3">
                <AdminEnumSelect label="Từ loại" options={ADMIN_POS_LABELS} value={v.pos} onValue={(x) => x && set('pos', x)} />
                <AdminEnumSelect label="Bậc" options={LEVEL_LABELS} order={ADMIN_LEVELS} value={v.level} onValue={(x) => x && set('level', x)} />
                <Field label="Trọng âm (vị trí)" type="number" min={0} value={v.accent ?? ''} onChange={(e) => set('accent', e.target.value === '' ? null : Number(e.target.value))} />
              </AdminFormRow>
              <Field label="Nghĩa tiếng Việt" value={v.meaningVi} onChange={(e) => set('meaningVi', e.target.value)} error={errors.meaningVi} />
              <Field label="Nghĩa tiếng Anh" value={v.meaningEn ?? ''} onChange={(e) => set('meaningEn', e.target.value || null)} />
              <AdminFormRow className="sm:grid-cols-3">
                <Select label="Chủ đề" value={v.topicId ?? ''} onChange={(e) => set('topicId', e.target.value || null)}>
                  <option value="">— Không —</option>
                  {lookups.topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.nameVi}</option>
                  ))}
                </Select>
                <AdminEnumSelect label="Tầng lịch sự" options={ADMIN_REGISTER_LABELS} allowEmpty value={v.register} onValue={(x) => set('register', x)} />
                <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={v.status} onValue={(x) => x && set('status', x)} />
              </AdminFormRow>
              <Select label="Audio phát âm" value={v.audioId ?? ''} onChange={(e) => set('audioId', e.target.value || null)}>
                <option value="">— Không —</option>
                {lookups.media.filter((m) => m.mime.startsWith('audio/')).map((m) => (
                  <option key={m.id} value={m.id}>{m.r2Key}</option>
                ))}
              </Select>
              <TextareaField label="Ghi chú dùng khi nào, tránh nhầm với từ nào" rows={3} value={v.noteVi ?? ''} onChange={(e) => set('noteVi', e.target.value || null)} />
            </AdminFormSection>

            <AdminFormSection title="Ví dụ">
              {v.examples.map((e, i) => (
                <div key={i} className="border-l-2 border-ln pl-3">
                  <div className="mb-2 flex items-start gap-2">
                    <TextareaField label={`Câu ${i + 1}`} rows={2} className="flex-1 [&_textarea]:jp" value={e.sentenceJa} onChange={(ev) => set('examples', v.examples.map((x, j) => (j === i ? { ...x, sentenceJa: ev.target.value } : x)))} error={errors[`examples.${i}.sentenceJa`]} />
                    <button type="button" aria-label="Bỏ ví dụ" onClick={() => set('examples', v.examples.filter((_, j) => j !== i))} className="cursor-pointer mt-6 grid size-8 place-items-center rounded-md text-fg3 hover:bg-ng-soft hover:text-ng">
                      <FaXmark className="size-3" />
                    </button>
                  </div>
                  <Field label="Nghĩa" value={e.meaningVi} onChange={(ev) => set('examples', v.examples.map((x, j) => (j === i ? { ...x, meaningVi: ev.target.value } : x)))} error={errors[`examples.${i}.meaningVi`]} />
                  <AdminFormRow className="mt-2">
                    <Field label="Kana" className="[&_input]:jp" value={e.sentenceKana ?? ''} onChange={(ev) => set('examples', v.examples.map((x, j) => (j === i ? { ...x, sentenceKana: ev.target.value || null } : x)))} />
                    <Field label="Bối cảnh (email · meeting · phone…)" value={e.contextTag ?? ''} onChange={(ev) => set('examples', v.examples.map((x, j) => (j === i ? { ...x, contextTag: ev.target.value || null } : x)))} />
                  </AdminFormRow>
                </div>
              ))}
              <Button type="button" size="sm" className="self-start" onClick={() => set('examples', [...v.examples, { sentenceJa: '', sentenceKana: null, meaningVi: '', contextTag: null, audioId: null }])}>
                <FaPlus className="size-3" /> Thêm ví dụ
              </Button>
            </AdminFormSection>

            <AdminFormSection title="Quan hệ" hint="言う → おっしゃる (尊敬語) / 申す (謙譲語). Chỗ người học BJT sai nhiều nhất.">
              <ul className="flex flex-wrap gap-1.5">
                {v.relations.length === 0 && <li className="text-xs text-fg3">Chưa có.</li>}
                {v.relations.map((r) => (
                  <li key={`${r.relation}-${r.relatedId}`} className="flex items-center gap-1.5 rounded-md bg-(image:--g-soft) py-1 pl-2.5 pr-1 text-xs text-acc-hi">
                    <span className="opacity-70">{ADMIN_RELATION_LABELS[r.relation]}</span>
                    <span className="jp font-semibold">{vocabName.get(r.relatedId) ?? r.relatedId}</span>
                    <button type="button" aria-label="Bỏ" onClick={() => set('relations', v.relations.filter((x) => x !== r))} className="cursor-pointer grid size-5 place-items-center rounded hover:bg-ng-soft hover:text-ng">
                      <FaXmark className="size-2.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-end gap-2">
                <Select label="Quan hệ" value={relPick.relation} onChange={(e) => setRelPick({ ...relPick, relation: e.target.value as typeof relPick.relation })} className="w-40">
                  {VOCAB_RELATIONS.map((r) => (
                    <option key={r} value={r}>{ADMIN_RELATION_LABELS[r]}</option>
                  ))}
                </Select>
                <Select label="Từ" value={relPick.id} onChange={(e) => setRelPick({ ...relPick, id: e.target.value })} className="flex-1">
                  <option value="">— Chọn —</option>
                  {lookups.vocab.filter((x) => x.id !== editing?.id).map((x) => (
                    <option key={x.id} value={x.id}>{x.headword} · {x.readingKana}</option>
                  ))}
                </Select>
                <Button type="button" disabled={!relPick.id} onClick={() => { set('relations', [...v.relations, { relatedId: relPick.id, relation: relPick.relation }]); setRelPick({ ...relPick, id: '' }); }}>
                  <FaPlus className="size-3" /> Thêm
                </Button>
              </div>
            </AdminFormSection>
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
