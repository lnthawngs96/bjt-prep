import { notFound, redirect } from 'next/navigation';
import { getAttempt, getMockTest, getSet } from '@/lib/data/attempts';
import { getGroupsForExamByMockTest, getGroupsForExamBySet } from '@/lib/data/questions';
import { getPartsWithSections } from '@/lib/data/sections';
import { getPlaybackUrl } from '@/lib/data/media';
import { getSession } from '@/lib/auth-server';
import { audioPlayOnce, buildExamParts, practiceTimeLimitSec } from '@/lib/exam-rules';
import { ExamRunner } from './ExamRunner';

/** Màn làm bài không có header — nó nằm ngoài layout học viên về mặt thị giác. */
export default async function ExamPage({ params }: PageProps<'/exam/[attemptId]'>) {
  const { attemptId } = await params;

  // Lượt làm bài là của một người. Chưa đăng nhập thì đi đăng nhập rồi quay lại;
  // đăng nhập rồi mà không phải chủ thì thấy như không tồn tại.
  const session = await getSession();
  if (!session) redirect(`/login?next=/exam/${attemptId}`);

  const attempt = await getAttempt(attemptId, session.user.id);
  if (!attempt) notFound();
  // Đã nộp thì không làm lại — xem kết quả.
  if (attempt.finishedAt) redirect(`/result/${attemptId}`);

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
  if (!meta) notFound();

  // Đề thi thử chia thành các phần có đồng hồ riêng; bộ luyện tập là một phần.
  const partsWithSections = await getPartsWithSections();
  const parts = buildExamParts(
    groups,
    partsWithSections,
    attempt.mode,
    practiceTimeLimitSec('estMinutes' in meta ? meta.estMinutes : null),
  );
  if (parts.length === 0) notFound();

  // Lấy sẵn URL phát ở server — client không bao giờ tự dựng đường dẫn media.
  // TODO(r2): Phase 4 các URL này là presigned, hết hạn 10 phút, gắn với attempt đang mở.
  const mediaIds = [
    ...new Set(groups.flatMap((g) => g.materials.flatMap((m) => (m.mediaId ? [m.mediaId] : [])))),
  ];
  const mediaUrls = Object.fromEntries(
    await Promise.all(mediaIds.map(async (id) => [id, await getPlaybackUrl(id)] as const)),
  );

  return (
    <ExamRunner
      attemptId={attemptId}
      title={meta.titleVi}
      mode={attempt.mode}
      playOnce={audioPlayOnce(attempt.mode)}
      parts={parts}
      mediaUrls={mediaUrls}
      exitHref={attempt.mockTestId ? '/mock-test' : '/practice'}
    />
  );
}
