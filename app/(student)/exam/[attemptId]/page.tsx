import { notFound } from 'next/navigation';
import { audioPlayOnce, getFirstGroupOfSet, getSet, navigationModeFor } from '@/lib/data/attempts';
import { getGroupsForExamBySet } from '@/lib/data/questions';
import { getPartsWithSections, getSection } from '@/lib/data/sections';
import { getPlaybackUrl } from '@/lib/data/media';
import type { AttemptMode } from '@/lib/prisma-types';
import { ExamRunner } from './ExamRunner';

/** Màn làm bài không có header — nó nằm ngoài layout học viên về mặt thị giác. */
export default async function ExamPage({ params }: PageProps<'/exam/[attemptId]'>) {
  const { attemptId } = await params;

  // Giai đoạn tĩnh: attemptId dạng "att-<setId>".
  // TODO(db): đọc Attempt thật, kiểm userId khớp session rồi lấy mode và bộ đề từ đó.
  const setId = attemptId.replace(/^att-/, '');
  const set = await getSet(setId);
  if (!set) notFound();

  const mode: AttemptMode = 'PRACTICE';
  const [groups, firstGroup, section, parts] = await Promise.all([
    getGroupsForExamBySet(setId),
    getFirstGroupOfSet(setId),
    getSection(set.sectionCode),
    getPartsWithSections(),
  ]);
  if (groups.length === 0 || !firstGroup || !section) notFound();

  const part = parts.find((p) => p.sections.some((s) => s.code === section.code));

  // Lấy sẵn URL phát ở server — client không bao giờ tự dựng đường dẫn media.
  // TODO(r2): Phase 4 các URL này là presigned, hết hạn 10 phút.
  const mediaIds = [
    ...new Set(
      groups.flatMap((g) =>
        g.materials.flatMap((m) => (m.mediaId ? [m.mediaId] : [])),
      ),
    ),
  ];
  const mediaUrls = Object.fromEntries(
    await Promise.all(mediaIds.map(async (id) => [id, await getPlaybackUrl(id)] as const)),
  );

  return (
    <ExamRunner
      attemptId={attemptId}
      partNameJa={part?.nameJa ?? section.nameJa}
      sectionLabel={`Section ${section.order}`}
      timeLimitSec={(set.estMinutes ?? 15) * 60}
      navigationMode={navigationModeFor(mode, section.code)}
      playOnce={audioPlayOnce(mode)}
      groups={groups}
      mediaUrls={mediaUrls}
    />
  );
}
