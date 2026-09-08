'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminPipelineBar } from './AdminPipelineBar';
import { AdminQuestionForm } from './AdminQuestionForm';
import { AdminStatusBadge } from './AdminStatusBadge';
import { ADMIN_PART_LABELS, ADMIN_SECTION_SHORT, levelLabel } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import {
  handleDeleteAdminQuestion,
  handleGetAdminQuestion,
  handlePatchAdminQuestion,
  handlePostAdminQuestions,
} from '@/services/api/admin/questionsApi';
import type { AdminLookups, AdminQuestionEditor, AdminQuestionRow } from '@/lib/data/types';
import type { QuestionInput } from '@/lib/validation/admin/question';
import type { ContentStatus, Part } from '@/lib/prisma-types';

function emptyQuestion(groupId = ''): QuestionInput {
  return {
    groupId,
    order: 1,
    level: 'J3',
    stemJa: '',
    stemVi: null,
    audioStartMs: null,
    audioEndMs: null,
    explanationVi: null,
    businessNoteVi: null,
    status: 'DRAFT',
    options: [1, 2, 3, 4].map((order) => ({ order, textJa: null, isCorrect: order === 1, distractorNote: null })),
    tagIds: [],
    vocabLinks: [],
    grammarLinks: [],
  };
}

function toInput(q: AdminQuestionEditor): QuestionInput {
  return {
    groupId: q.groupId,
    order: q.order,
    level: q.level,
    stemJa: q.stemJa,
    stemVi: q.stemVi,
    audioStartMs: q.audioStartMs,
    audioEndMs: q.audioEndMs,
    explanationVi: q.explanationVi,
    businessNoteVi: q.businessNoteVi,
    status: q.status,
    options: [1, 2, 3, 4].map((order) => {
      const o = q.options.find((x) => x.order === order);
      return { order, textJa: o?.textJa ?? null, isCorrect: o?.isCorrect ?? false, distractorNote: o?.distractorNote ?? null };
    }),
    tagIds: q.tagIds,
    vocabLinks: q.vocabLinks.map((l) => ({ vocabId: l.vocabId, relevance: l.relevance === 'appears' ? 'appears' : 'tested' })),
    grammarLinks: q.grammarLinks.map((l) => ({ grammarId: l.grammarId, relevance: l.relevance === 'appears' ? 'appears' : 'tested' })),
  };
}

type Editing = { id: string | null; value: QuestionInput };

export function AdminQuestionList({ rows, lookups }: { rows: AdminQuestionRow[]; lookups: AdminLookups }) {
  const toast = useToast();
  const [part, setPart] = useState<Part | 'ALL'>('ALL');
  const [status, setStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const partOf = new Map(lookups.sections.map((s) => [s.code, s.part]));
  const counts: Partial<Record<ContentStatus, number>> = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;

  const q = search.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (part === 'ALL' || partOf.get(r.sectionCode) === part) &&
      (status === 'ALL' || r.status === status) &&
      (!q || r.stemJa.toLowerCase().includes(q) || r.groupTitle.toLowerCase().includes(q)),
  );

  const create = useAdminMutation(handlePostAdminQuestions, { successMessage: 'Đã thêm câu hỏi', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminQuestion, { successMessage: 'Đã lưu câu hỏi', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminQuestion, { successMessage: 'Đã xoá câu hỏi', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  async function openEditor(id: string) {
    setLoadingId(id);
    const r = await handleGetAdminQuestion(id);
    setLoadingId(null);
    if (!r.ok) {
      toast('Không tải được câu hỏi. Tải lại trang.', 'ng');
      return;
    }
    setEditing({ id, value: toInput(r.data) });
  }

  function submit() {
    if (!editing) return;
    if (editing.id) void update.run(editing.id, editing.value);
    else void create.run(editing.value);
  }

  return (
    <>
      <AdminPipelineBar counts={counts} />
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo câu hỏi hoặc tên nhóm…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: part === 'ALL', onClick: () => setPart('ALL') },
          ...(Object.keys(ADMIN_PART_LABELS) as Part[]).map((p) => ({
            id: p,
            label: <span className="jp">{ADMIN_PART_LABELS[p]}</span>,
            pressed: part === p,
            onClick: () => setPart(p),
          })),
          { id: 'NEEDS_AUDIO', label: 'Chờ audio', pressed: status === 'NEEDS_AUDIO', onClick: () => setStatus(status === 'NEEDS_AUDIO' ? 'ALL' : 'NEEDS_AUDIO') },
          { id: 'FLAGGED', label: 'Bị báo lỗi', pressed: status === 'FLAGGED', onClick: () => setStatus(status === 'FLAGGED' ? 'ALL' : 'FLAGGED') },
          { id: 'DRAFT', label: 'Đang soạn', pressed: status === 'DRAFT', onClick: () => setStatus(status === 'DRAFT' ? 'ALL' : 'DRAFT') },
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: emptyQuestion(lookups.groups[0]?.id ?? '') })}>
          <FaPlus className="size-3" /> Thêm câu hỏi
        </Button>
      </AdminFilterBar>

      {visible.length === 0 ? (
        <AdminEmpty>Không có câu nào khớp bộ lọc.</AdminEmpty>
      ) : (
        <div>
          {visible.map((r) => (
            <AdminListRow
              key={r.id}
              onClick={() => void openEditor(r.id)}
              leading={<span className="jp">{ADMIN_SECTION_SHORT[r.sectionCode]}</span>}
              title={<span className="jp font-normal">{r.stemJa}</span>}
              subtitle={`${r.groupTitle} · câu ${r.order}${r.spokenOptions ? ' · phương án đọc trong audio' : ''}`}
              columns={<span className="tnum w-8">{levelLabel(r.level)}</span>}
              trailing={
                <>
                  {loadingId === r.id && <Badge tone="neutral">Đang tải…</Badge>}
                  <AdminStatusBadge status={r.status} />
                </>
              }
            />
          ))}
        </div>
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={submit}
        saving={create.saving || update.saving || remove.saving}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {editing && (
          <AdminQuestionForm value={editing.value} onChange={(value) => setEditing({ ...editing, value })} lookups={lookups} errors={errors} />
        )}
      </AdminEntityDrawer>
    </>
  );
}
