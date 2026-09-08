'use client';

import { Field, TextareaField } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { AdminFormError, AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import { AdminLinkPicker } from './form/AdminLinkPicker';
import { AdminOptionsEditor } from './form/AdminOptionsEditor';
import { AdminTagPicker } from './form/AdminTagPicker';
import {
  ADMIN_LEVELS,
  ADMIN_SECTION_SHORT,
  ADMIN_SPOKEN_OPTION_SECTIONS,
  ADMIN_STATUS_LABELS,
  levelLabel,
} from '@/constants/admin/adminLabels';
import type { AdminLookups } from '@/lib/data/types';
import type { QuestionInput } from '@/lib/validation/admin/question';
import type { Level } from '@/lib/prisma-types';

const LEVEL_LABELS = Object.fromEntries(ADMIN_LEVELS.map((l) => [l, levelLabel(l)])) as Record<Level, string>;

/**
 * Đủ MỌI trường của Question và QuestionOption theo schema — đối chiếu từng dòng:
 * group · order · level · stemJa · stemVi · audioStartMs/EndMs · explanationVi ·
 * businessNoteVi · status · 4 phương án (textJa, isCorrect, distractorNote) ·
 * tag · liên kết từ vựng · liên kết ngữ pháp.
 * Không có: sectionCode (chép từ group), stemFurigana (chưa dùng), thống kê (cron).
 */
export function AdminQuestionForm({
  value,
  onChange,
  lookups,
  errors,
}: {
  value: QuestionInput;
  onChange: (v: QuestionInput) => void;
  lookups: AdminLookups;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof QuestionInput>(k: K, v: QuestionInput[K]) => onChange({ ...value, [k]: v });
  const group = lookups.groups.find((g) => g.id === value.groupId);
  const spoken = Boolean(group && ADMIN_SPOKEN_OPTION_SECTIONS.includes(group.sectionCode));
  const hasAudio = group ? ['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3'].includes(group.sectionCode) : false;

  return (
    <>
      <AdminFormSection title="Nhóm câu" hint="Mọi câu đều thuộc một nhóm (大問), kể cả câu đứng một mình. Section chép từ nhóm.">
        <Select label="Nhóm" value={value.groupId} onChange={(e) => set('groupId', e.target.value)} error={errors.groupId}>
          <option value="">— Chọn nhóm —</option>
          {lookups.groups.map((g) => (
            <option key={g.id} value={g.id}>
              {ADMIN_SECTION_SHORT[g.sectionCode]} · {g.titleAdmin}
            </option>
          ))}
        </Select>
        <AdminFormRow className="sm:grid-cols-3">
          <Field label="Thứ tự trong nhóm" type="number" min={1} value={value.order} onChange={(e) => set('order', Number(e.target.value))} error={errors.order} />
          <AdminEnumSelect label="Bậc" options={LEVEL_LABELS} order={ADMIN_LEVELS} value={value.level} onValue={(v) => v && set('level', v)} />
          <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={value.status} onValue={(v) => v && set('status', v)} />
        </AdminFormRow>
      </AdminFormSection>

      <AdminFormSection title="Câu hỏi">
        <TextareaField label="Câu hỏi (tiếng Nhật)" rows={2} className="[&_textarea]:jp" value={value.stemJa} onChange={(e) => set('stemJa', e.target.value)} error={errors.stemJa} />
        <TextareaField label="Bản dịch tiếng Việt" hint="Chỉ hiện ở màn xem lại, không hiện lúc thi." rows={2} value={value.stemVi ?? ''} onChange={(e) => set('stemVi', e.target.value || null)} error={errors.stemVi} />
        {hasAudio && (
          <AdminFormRow>
            <Field label="Đoạn audio bắt đầu (ms)" type="number" min={0} value={value.audioStartMs ?? ''} onChange={(e) => set('audioStartMs', e.target.value === '' ? null : Number(e.target.value))} error={errors.audioStartMs} />
            <Field label="Đoạn audio kết thúc (ms)" type="number" min={0} value={value.audioEndMs ?? ''} onChange={(e) => set('audioEndMs', e.target.value === '' ? null : Number(e.target.value))} error={errors.audioEndMs} />
          </AdminFormRow>
        )}
      </AdminFormSection>

      <AdminFormSection title="Phương án">
        <AdminOptionsEditor value={value.options} onChange={(o) => set('options', o)} spoken={spoken} errors={errors} />
        <AdminFormError message={errors.options} />
      </AdminFormSection>

      <AdminFormSection title="Giải thích cho người học" hint="Đây là chỗ màn kết quả tạo ra giá trị thật.">
        <TextareaField label="Vì sao đáp án đúng" rows={3} value={value.explanationVi ?? ''} onChange={(e) => set('explanationVi', e.target.value || null)} error={errors.explanationVi} />
        <TextareaField label="Bối cảnh công sở cần biết" rows={3} value={value.businessNoteVi ?? ''} onChange={(e) => set('businessNoteVi', e.target.value || null)} error={errors.businessNoteVi} />
      </AdminFormSection>

      <AdminFormSection title="Nhãn kỹ năng" hint='Nguồn của khối "Đang yếu nhất". Không có nhãn thì chỉ nói được "yếu phần 聴読解".'>
        <AdminTagPicker tags={lookups.tags} value={value.tagIds} onChange={(ids) => set('tagIds', ids)} />
      </AdminFormSection>

      <AdminFormSection title="Từ vựng và ngữ pháp liên kết" hint="Sai câu này thì gợi ý ôn gì.">
        <AdminLinkPicker
          label="Từ vựng"
          pool={lookups.vocab.map((v) => ({ id: v.id, label: v.headword, hint: v.readingKana }))}
          value={value.vocabLinks.map((l) => ({ id: l.vocabId, relevance: l.relevance }))}
          onChange={(links) => set('vocabLinks', links.map((l) => ({ vocabId: l.id, relevance: l.relevance })))}
        />
        <AdminLinkPicker
          label="Ngữ pháp"
          pool={lookups.grammar.map((g) => ({ id: g.id, label: g.pattern, hint: g.slug }))}
          value={value.grammarLinks.map((l) => ({ id: l.grammarId, relevance: l.relevance }))}
          onChange={(links) => set('grammarLinks', links.map((l) => ({ grammarId: l.id, relevance: l.relevance })))}
        />
      </AdminFormSection>
    </>
  );
}
