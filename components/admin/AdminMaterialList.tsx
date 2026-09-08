'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field, TextareaField } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Markdown } from '@/components/common/Markdown';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminChartSeriesEditor } from './form/AdminChartSeriesEditor';
import { AdminEnumSelect } from './form/AdminEnumSelect';
import { AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import { AdminTableGridEditor } from './form/AdminTableGridEditor';
import { AdminTranscriptEditor } from './form/AdminTranscriptEditor';
import { ADMIN_KIND_LABELS, ADMIN_STATUS_LABELS } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminMaterial, handlePatchAdminMaterial, handlePostAdminMaterials } from '@/services/api/admin/materialsApi';
import type { AdminLookups, AdminMaterialRow } from '@/lib/data/types';
import type { MaterialInput, TranscriptLineInput } from '@/lib/validation/admin/material';
import type { ContentStatus, MaterialKind } from '@/lib/prisma-types';
import type { MaterialChartBody, MaterialTableBody } from '@/types/common/material';

/** Form giữ mọi nhánh cùng lúc; đổi kind không mất dữ liệu đã gõ. Gửi lên chỉ nhánh đang chọn. */
type FormValue = {
  kind: MaterialKind;
  titleAdmin: string;
  status: ContentStatus;
  altText: string | null;
  mediaId: string;
  transcript: TranscriptLineInput[];
  table: Required<Pick<MaterialTableBody, 'headers' | 'rows' | 'numericColumns'>> & { caption?: string };
  doc: string;
  chart: MaterialChartBody & { chartType: 'bar' };
};

function empty(): FormValue {
  return {
    kind: 'AUDIO',
    titleAdmin: '',
    status: 'DRAFT',
    altText: null,
    mediaId: '',
    transcript: [],
    table: { headers: ['', ''], rows: [['', '']], numericColumns: [] },
    doc: '',
    chart: { chartType: 'bar', categories: [''], series: [{ name: '', values: [0] }] },
  };
}

function toForm(m: AdminMaterialRow): FormValue {
  const f = empty();
  f.kind = m.kind;
  f.titleAdmin = m.titleAdmin;
  f.status = m.status;
  f.altText = m.altText;
  f.mediaId = m.mediaId ?? '';
  if (Array.isArray(m.transcript)) f.transcript = m.transcript as TranscriptLineInput[];
  const body = m.body as Record<string, unknown> | null;
  if (body) {
    if (m.kind === 'TABLE') {
      const t = body as Partial<FormValue['table']>;
      f.table = { headers: t.headers ?? [''], rows: t.rows ?? [['']], numericColumns: t.numericColumns ?? [], caption: t.caption };
    }
    if (m.kind === 'DOCUMENT') f.doc = String(body.content ?? '');
    if (m.kind === 'CHART') f.chart = { ...(body as FormValue['chart']), chartType: 'bar' };
  }
  return f;
}

function toInput(f: FormValue): MaterialInput {
  const base = { titleAdmin: f.titleAdmin, status: f.status, altText: f.altText };
  switch (f.kind) {
    case 'AUDIO':
      return { kind: 'AUDIO', ...base, mediaId: f.mediaId, transcript: f.transcript };
    case 'IMAGE':
      return { kind: 'IMAGE', ...base, mediaId: f.mediaId };
    // zod suy ra `caption` là khoá bắt buộc (giá trị có thể undefined) nên ghi tường minh.
    case 'TABLE':
      return { kind: 'TABLE', ...base, body: { ...f.table, caption: f.table.caption } };
    case 'DOCUMENT':
      return { kind: 'DOCUMENT', ...base, body: { format: 'markdown', content: f.doc } };
    case 'CHART':
      return { kind: 'CHART', ...base, body: { ...f.chart, caption: f.chart.caption } };
  }
}

type Editing = { id: string | null; value: FormValue };

export function AdminMaterialList({ rows, lookups }: { rows: AdminMaterialRow[]; lookups: AdminLookups }) {
  const [kind, setKind] = useState<MaterialKind | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);

  const create = useAdminMutation(handlePostAdminMaterials, { successMessage: 'Đã thêm tài liệu', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminMaterial, { successMessage: 'Đã lưu tài liệu', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminMaterial, { successMessage: 'Đã xoá tài liệu', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (kind === 'ALL' || r.kind === kind) && (!q || r.titleAdmin.toLowerCase().includes(q)));

  const v = editing?.value;
  const set = <K extends keyof FormValue>(k: K, val: FormValue[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });
  const mediaPool = lookups.media.filter((m) => (v?.kind === 'IMAGE' ? m.mime.startsWith('image/') : m.mime.startsWith('audio/')));

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên tài liệu…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: kind === 'ALL', onClick: () => setKind('ALL') },
          ...(Object.keys(ADMIN_KIND_LABELS) as MaterialKind[]).map((k) => ({ id: k, label: ADMIN_KIND_LABELS[k], pressed: kind === k, onClick: () => setKind(k) })),
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Thêm tài liệu
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có tài liệu nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toForm(r) })}
            leading={ADMIN_KIND_LABELS[r.kind]}
            title={<span className="jp font-normal">{r.titleAdmin}</span>}
            subtitle={r.media ? r.media.r2Key : r.kind === 'DOCUMENT' ? 'Markdown' : r.kind === 'TABLE' ? 'Bảng' : 'Biểu đồ'}
            columns={<span className="tnum w-16">{r.groupCount} nhóm</span>}
            trailing={<AdminStatusBadge status={r.status} />}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa tài liệu' : 'Thêm tài liệu'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, toInput(editing.value)) : void create.run(toInput(editing.value)))}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Tài liệu">
              <Field label="Tên nội bộ" value={v.titleAdmin} onChange={(e) => set('titleAdmin', e.target.value)} error={errors.titleAdmin} />
              <AdminFormRow>
                <AdminEnumSelect label="Loại" options={ADMIN_KIND_LABELS} value={v.kind} onValue={(x) => x && set('kind', x)} />
                <AdminEnumSelect label="Trạng thái" options={ADMIN_STATUS_LABELS} value={v.status} onValue={(x) => x && set('status', x)} />
              </AdminFormRow>
              <TextareaField label="Mô tả thay thế (alt)" hint="Cho screen reader và khi media không tải được." rows={2} value={v.altText ?? ''} onChange={(e) => set('altText', e.target.value || null)} />
            </AdminFormSection>

            {(v.kind === 'AUDIO' || v.kind === 'IMAGE') && (
              <AdminFormSection title="Media" hint="Chọn từ thư viện media. Chưa có thì đăng ký ở trang Media trước.">
                <Select label={v.kind === 'AUDIO' ? 'File audio' : 'File ảnh'} value={v.mediaId} onChange={(e) => set('mediaId', e.target.value)} error={errors.mediaId}>
                  <option value="">— Chọn —</option>
                  {mediaPool.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.r2Key}
                    </option>
                  ))}
                </Select>
              </AdminFormSection>
            )}

            {v.kind === 'AUDIO' && (
              <AdminFormSection title="Transcript" hint="Từng lượt nói kèm startMs/endMs. Với L1/L2/LR1 ghi cả câu hỏi và bốn phương án (vai narrator / option).">
                <AdminTranscriptEditor value={v.transcript} onChange={(t) => set('transcript', t)} errors={errors} />
              </AdminFormSection>
            )}

            {v.kind === 'TABLE' && (
              <AdminFormSection title="Bảng số liệu">
                <AdminTableGridEditor value={v.table} onChange={(t) => set('table', t)} errors={errors} />
              </AdminFormSection>
            )}

            {v.kind === 'DOCUMENT' && (
              <AdminFormSection title="Văn bản (markdown)" hint="Dòng trống tách đoạn · **đậm** · # tiêu đề · - gạch đầu dòng. Không nhận HTML.">
                <TextareaField label="Nội dung" rows={12} className="[&_textarea]:jp" value={v.doc} onChange={(e) => set('doc', e.target.value)} error={errors['body.content']} />
                {v.doc.trim() && (
                  <div className="rounded-md border border-ln px-4 py-3">
                    <p className="mb-2 text-xs font-bold text-fg2">Xem trước</p>
                    <Markdown source={v.doc} className="jp text-sm leading-relaxed" />
                  </div>
                )}
              </AdminFormSection>
            )}

            {v.kind === 'CHART' && (
              <AdminFormSection title="Biểu đồ cột">
                <AdminChartSeriesEditor value={v.chart} onChange={(c) => set('chart', c)} errors={errors} />
              </AdminFormSection>
            )}
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
