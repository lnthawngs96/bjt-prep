import { notFound } from 'next/navigation';
import {
  getFirstGroupOfMockTest,
  getFirstGroupOfSet,
  getMockTest,
  getSet,
} from '@/lib/data/attempts';
import { getGroupsForExamByMockTest, getGroupsForExamBySet } from '@/lib/data/questions';
import { getPartsWithSections, getSection } from '@/lib/data/sections';
import { getPlaybackUrl } from '@/lib/data/media';
import { audioPlayOnce, navigationModeFor } from '@/lib/exam-rules';
import type { AttemptMode } from '@/lib/prisma-types';
import { ExamRunner } from './ExamRunner';

/** Màn làm bài không có header — nó nằm ngoài layout học viên về mặt thị giác. */
export default async function ExamPage({ params }: PageProps<'/exam/[attemptId]'>) {
  const { attemptId } = await params;

  // Giai đoạn tĩnh: attemptId dạng "att-<setId>" hoặc "att-<mockTestId>".
  // TODO(db): đọc Attempt thật, kiểm userId khớp session rồi lấy mode và đề từ đó.
  const refId = attemptId.replace(/^att-/, '');
  const mockTest = await getMockTest(refId);
  const mode: AttemptMode = mockTest ? 'MOCK' : 'PRACTICE';

  const [groups, firstGroup, title] = mockTest
    ? await Promise.all([
        getGroupsForExamByMockTest(refId),
        getFirstGroupOfMockTest(refId),
        Promise.resolve(mockTest.titleVi),
      ])
    : await (async () => {
        const set = await getSet(refId);
        if (!set) return [[], null, ''] as const;
        return Promise.all([
          getGroupsForExamBySet(refId),
          getFirstGroupOfSet(refId),
          Promise.resolve(set.titleVi),
        ]);
      })();

  if (groups.length === 0 || !firstGroup) notFound();

  const [section, parts] = await Promise.all([
    getSection(firstGroup.sectionCode),
    getPartsWithSections(),
  ]);
  if (!section) notFound();

  const part = parts.find((p) => p.sections.some((s) => s.code === section.code));

  // Lấy sẵn URL phát ở server — client không bao giờ tự dựng đường dẫn media.
  // TODO(r2): Phase 4 các URL này là presigned, hết hạn 10 phút, gắn với attempt đang mở.
  const mediaIds = [
    ...new Set(groups.flatMap((g) => g.materials.flatMap((m) => (m.mediaId ? [m.mediaId] : [])))),
  ];
  const mediaUrls = Object.fromEntries(
    await Promise.all(mediaIds.map(async (id) => [id, await getPlaybackUrl(id)] as const)),
  );

  // Thời gian: đề thi thử dùng giới hạn của phần, bộ luyện tập dùng estMinutes.
  const timeLimitSec = mockTest ? (part?.timeLimitSec ?? 1800) : 15 * 60;

  return (
    <ExamRunner
      attemptId={attemptId}
      title={title}
      partNameJa={part?.nameJa ?? section.nameJa}
      sectionLabel={`Section ${section.order}`}
      timeLimitSec={timeLimitSec}
      navigationMode={navigationModeFor(mode, section.code)}
      playOnce={audioPlayOnce(mode)}
      groups={groups}
      mediaUrls={mediaUrls}
    />
  );
}
