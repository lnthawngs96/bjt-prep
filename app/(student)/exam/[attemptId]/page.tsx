import { notFound } from 'next/navigation';
import { getAttempt } from '@/lib/data/attempts';
import { getGroupsForExamByMockTest, getGroupsForExamBySet } from '@/lib/data/questions';
import { getMockTest, getSet } from '@/lib/data/attempts';
import { getPartsWithSections, getSection } from '@/lib/data/sections';
import { getPlaybackUrl } from '@/lib/data/media';
import { audioPlayOnce, navigationModeFor } from '@/lib/exam-rules';
import { ExamRunner } from './ExamRunner';

/** Màn làm bài không có header — nó nằm ngoài layout học viên về mặt thị giác. */
export default async function ExamPage({ params }: PageProps<'/exam/[attemptId]'>) {
  const { attemptId } = await params;

  // Đọc bản ghi lượt làm bài thay vì suy từ chuỗi id.
  // TODO(db): getAttempt kiểm luôn attempt.userId === session.user.id.
  const attempt = await getAttempt(attemptId);
  if (!attempt) notFound();

  const [groups, meta] = attempt.mockTestId
    ? await Promise.all([
        getGroupsForExamByMockTest(attempt.mockTestId),
        getMockTest(attempt.mockTestId),
      ])
    : attempt.questionSetId
      ? await Promise.all([
          getGroupsForExamBySet(attempt.questionSetId),
          getSet(attempt.questionSetId),
        ])
      : [[], null];

  const firstGroup = groups[0];
  if (!firstGroup || !meta) notFound();

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

  // Đề thi thử dùng giới hạn thời gian của phần; bộ luyện tập dùng estMinutes.
  const timeLimitSec = attempt.mockTestId
    ? (part?.timeLimitSec ?? 1800)
    : ('estMinutes' in meta ? (meta.estMinutes ?? 15) : 15) * 60;

  return (
    <ExamRunner
      attemptId={attemptId}
      title={meta.titleVi}
      partNameJa={part?.nameJa ?? section.nameJa}
      sectionLabel={`Section ${section.order}`}
      timeLimitSec={timeLimitSec}
      navigationMode={navigationModeFor(attempt.mode, section.code)}
      playOnce={audioPlayOnce(attempt.mode)}
      groups={groups}
      mediaUrls={mediaUrls}
    />
  );
}
