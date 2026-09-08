import Image from 'next/image';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { Markdown } from '@/components/common/Markdown';
import type { MaterialWithMedia } from '@/lib/data/types';
import type {
  MaterialChartBody,
  MaterialDocBody,
  MaterialTableBody,
} from '@/types/common/material';

export interface MaterialViewProps {
  material: MaterialWithMedia;
  /** URL đã lấy sẵn qua getPlaybackUrl ở server. */
  mediaUrl?: string;
  playOnce?: boolean;
  audioStartMs?: number | null;
  audioEndMs?: number | null;
}

/** Vẽ tài liệu đề bài theo `kind`. Đây là chỗ AUDIO/TABLE/DOCUMENT/CHART/IMAGE rẽ nhánh. */
export function MaterialView({
  material,
  mediaUrl,
  playOnce,
  audioStartMs,
  audioEndMs,
}: MaterialViewProps) {
  if (material.kind === 'AUDIO') {
    if (!mediaUrl) return null;
    return (
      <AudioPlayer
        src={mediaUrl}
        waveform={Array.isArray(material.media?.waveform) ? (material.media.waveform as number[]) : null}
        startMs={audioStartMs}
        endMs={audioEndMs}
        playOnce={playOnce}
        className="mb-5"
      />
    );
  }

  if (material.kind === 'IMAGE') {
    if (!mediaUrl) return null;
    return (
      <figure className="mb-5 overflow-hidden rounded-lg border border-ln">
        <Image
          src={mediaUrl}
          alt={material.altText ?? ''}
          width={640}
          height={400}
          className="h-auto w-full"
          unoptimized
        />
      </figure>
    );
  }

  if (material.kind === 'TABLE') {
    const body = material.body as MaterialTableBody | null;
    if (!body) return null;
    const numeric = new Set(body.numericColumns ?? []);
    return (
      <div className="mb-5 rounded-lg border border-ln px-5 py-4">
        {body.caption && (
          <div className="jp mb-3 border-b border-ln pb-2 text-xs text-fg3">{body.caption}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {body.headers.map((h) => (
                  <th
                    key={h}
                    className="jp border border-ln bg-(image:--g-soft) px-2.5 py-2 text-xs font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`border border-ln px-2.5 py-2 ${
                        numeric.has(j) ? 'text-right tabular-nums' : 'jp'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (material.kind === 'CHART') {
    const body = material.body as MaterialChartBody | null;
    if (!body) return null;
    const max = Math.max(...body.series.flatMap((s) => s.values), 1);
    return (
      <div className="mb-5 rounded-lg border border-ln px-5 py-4">
        {body.caption && (
          <div className="jp mb-4 border-b border-ln pb-2 text-xs text-fg3">{body.caption}</div>
        )}
        <div className="flex h-40 items-end gap-4">
          {body.categories.map((cat, ci) => (
            <div key={cat} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                {body.series.map((s, si) => (
                  <i
                    key={s.name}
                    title={`${s.name} ${cat}: ${s.values[ci]}`}
                    style={{
                      height: `${(s.values[ci] / max) * 100}%`,
                      // Ba sắc độ trong dải gradient — vẫn một hệ màu, không thêm màu mới.
                      background: ['#1B4FD8', '#2E8FE0', '#23C9C2'][si % 3],
                    }}
                    className="w-3 rounded-t-sm"
                  />
                ))}
              </div>
              <span className="jp text-xs text-fg3">{cat}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 border-t border-ln pt-3 text-xs text-fg2">
          {body.series.map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <i
                aria-hidden
                style={{ background: ['#1B4FD8', '#2E8FE0', '#23C9C2'][si % 3] }}
                className="block size-2 rounded-sm"
              />
              <span className="jp">{s.name}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // DOCUMENT
  const body = material.body as MaterialDocBody | null;
  if (!body) return null;
  // Chỉ markdown. Parser tự viết không cho HTML lọt, nên không cần sanitizer.
  return (
    <div className="mb-5 rounded-lg border border-ln px-5 py-4">
      <Markdown source={body.content} className="jp text-sm leading-loose" />
    </div>
  );
}
