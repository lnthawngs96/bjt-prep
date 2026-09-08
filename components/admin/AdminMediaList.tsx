'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { AdminEntityDrawer } from './AdminEntityDrawer';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { AdminFormRow, AdminFormSection } from './form/AdminFormSection';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handleDeleteAdminMediaItem, handlePatchAdminMediaItem, handlePostAdminMedia } from '@/services/api/admin/materialsApi';
import type { AdminMediaRow } from '@/lib/data/types';
import type { MediaInput } from '@/lib/validation/admin/media';

const WAVE_BARS = 40;

function empty(): MediaInput {
  return { r2Key: '', mime: '', bytes: 0, durationMs: null, waveform: null };
}
function toInput(m: AdminMediaRow): MediaInput {
  return {
    r2Key: m.r2Key,
    mime: m.mime,
    bytes: m.bytes,
    durationMs: m.durationMs,
    waveform: Array.isArray(m.waveform) ? (m.waveform as number[]) : null,
  };
}

/** Tính thời lượng và 40 đỉnh sóng từ file audio ngay trong trình duyệt bằng Web Audio, không thư viện. */
async function analyzeAudio(file: File): Promise<{ durationMs: number; waveform: number[] }> {
  const ctx = new AudioContext();
  try {
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const data = buf.getChannelData(0);
    const block = Math.max(1, Math.floor(data.length / WAVE_BARS));
    const peaks: number[] = [];
    for (let i = 0; i < WAVE_BARS; i++) {
      let max = 0;
      for (let j = i * block; j < Math.min(data.length, (i + 1) * block); j++) max = Math.max(max, Math.abs(data[j]));
      peaks.push(max);
    }
    const top = Math.max(...peaks, 0.0001);
    return { durationMs: Math.round(buf.duration * 1000), waveform: peaks.map((p) => Math.round((p / top) * 100)) };
  } finally {
    await ctx.close();
  }
}

function fmtBytes(n: number) {
  return n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

type Editing = { id: string | null; value: MediaInput };

export function AdminMediaList({ rows }: { rows: AdminMediaRow[] }) {
  const [type, setType] = useState<'ALL' | 'audio' | 'image'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const create = useAdminMutation(handlePostAdminMedia, { successMessage: 'Đã đăng ký media', onSuccess: () => setEditing(null) });
  const update = useAdminMutation(handlePatchAdminMediaItem, { successMessage: 'Đã lưu media', onSuccess: () => setEditing(null) });
  const remove = useAdminMutation(handleDeleteAdminMediaItem, { successMessage: 'Đã xoá media', onSuccess: () => setEditing(null) });
  const errors = editing?.id ? update.fieldErrors : create.fieldErrors;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => (type === 'ALL' || r.mime.startsWith(type + '/')) && (!q || r.r2Key.toLowerCase().includes(q)));

  const v = editing?.value;
  const set = <K extends keyof MediaInput>(k: K, val: MediaInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: val } });

  async function onFile(file: File | undefined) {
    if (!file || !editing) return;
    const isAudio = file.type.startsWith('audio/');
    const next: MediaInput = {
      ...editing.value,
      r2Key: editing.value.r2Key || `${isAudio ? 'mock-audio' : 'mock-image'}/${file.name}`,
      mime: file.type || editing.value.mime,
      bytes: file.size,
    };
    if (isAudio) {
      setAnalyzing(true);
      try {
        const a = await analyzeAudio(file);
        next.durationMs = a.durationMs;
        next.waveform = a.waveform;
      } catch {
        /* định dạng không decode được thì để trống, admin nhập tay */
      }
      setAnalyzing(false);
    }
    setEditing({ ...editing, value: next });
  }

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo đường dẫn…"
        chips={[
          { id: 'ALL', label: 'Tất cả', pressed: type === 'ALL', onClick: () => setType('ALL') },
          { id: 'audio', label: 'Audio', pressed: type === 'audio', onClick: () => setType('audio') },
          { id: 'image', label: 'Ảnh', pressed: type === 'image', onClick: () => setType('image') },
        ]}
      >
        <Button variant="gradient" size="sm" onClick={() => setEditing({ id: null, value: empty() })}>
          <FaPlus className="size-3" /> Đăng ký file
        </Button>
      </AdminFilterBar>

      <p className="mb-4 text-xs text-fg3">
        Giai đoạn này file nằm tĩnh trong <code>public/</code>: chép file vào đó rồi đăng ký đường dẫn tương đối ở đây
        (ví dụ <code>mock-audio/l2-014.wav</code>). Khi lên R2 sẽ có upload thật.
      </p>

      {visible.length === 0 ? (
        <AdminEmpty>Chưa có media nào.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.id}
            onClick={() => setEditing({ id: r.id, value: toInput(r) })}
            leading={r.mime.startsWith('audio/') ? 'Audio' : r.mime.startsWith('image/') ? 'Ảnh' : r.mime}
            title={r.r2Key}
            subtitle={`${r.mime} · ${fmtBytes(r.bytes)}${r.durationMs ? ` · ${Math.round(r.durationMs / 1000)} giây` : ''}`}
            columns={<span className="tnum w-20">{r.usageCount} chỗ dùng</span>}
          />
        ))
      )}

      <AdminEntityDrawer
        open={editing !== null}
        title={editing?.id ? 'Sửa media' : 'Đăng ký media'}
        subtitle={editing?.id ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={() => editing && (editing.id ? void update.run(editing.id, editing.value) : void create.run(editing.value))}
        saving={create.saving || update.saving || remove.saving || analyzing}
        onDelete={editing?.id ? () => void remove.run(editing.id!) : undefined}
      >
        {v && (
          <>
            <AdminFormSection title="Chọn file để điền tự động" hint="Chỉ để đọc thông tin (mime, dung lượng, thời lượng, sóng). File vẫn phải tự chép vào public/.">
              <input type="file" accept="audio/*,image/*" onChange={(e) => void onFile(e.target.files?.[0])} className="text-sm" />
              {analyzing && <p className="text-xs text-fg3">Đang phân tích audio…</p>}
            </AdminFormSection>
            <AdminFormSection title="Thông tin file">
              <Field label="Đường dẫn trong public/" placeholder="mock-audio/ten-file.wav" value={v.r2Key} onChange={(e) => set('r2Key', e.target.value)} error={errors.r2Key} />
              <AdminFormRow className="sm:grid-cols-3">
                <Field label="MIME" placeholder="audio/wav" value={v.mime} onChange={(e) => set('mime', e.target.value)} error={errors.mime} />
                <Field label="Dung lượng (byte)" type="number" min={0} value={v.bytes} onChange={(e) => set('bytes', Number(e.target.value))} error={errors.bytes} />
                <Field label="Thời lượng (ms)" type="number" min={0} value={v.durationMs ?? ''} onChange={(e) => set('durationMs', e.target.value === '' ? null : Number(e.target.value))} />
              </AdminFormRow>
              <p className="text-xs text-fg3">Sóng: {v.waveform ? `${v.waveform.length} đỉnh` : 'chưa có — chọn file audio để tính'}</p>
            </AdminFormSection>
            {v.r2Key && (
              <AdminFormSection title="Xem trước">
                {v.mime.startsWith('audio/') && <AudioPlayer src={'/' + v.r2Key} waveform={v.waveform} />}
                {v.mime.startsWith('image/') && (
                  <Image src={'/' + v.r2Key} alt="" width={640} height={400} unoptimized className="h-auto w-full rounded-md border border-ln" />
                )}
              </AdminFormSection>
            )}
          </>
        )}
      </AdminEntityDrawer>
    </>
  );
}
