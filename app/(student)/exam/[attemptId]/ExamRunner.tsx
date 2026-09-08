'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaClock, FaFlag } from 'react-icons/fa6';
import { MaterialView } from '@/components/student/MaterialView';
import { canNavigate, useExamSession } from '@/lib/store/examSession';
import { cn } from '@/lib/utils';
import type { GroupForExam, NavigationMode, QuestionForExam } from '@/lib/data/types';

export interface ExamRunnerProps {
  attemptId: string;
  title: string;
  partNameJa: string;
  sectionLabel: string;
  timeLimitSec: number;
  navigationMode: NavigationMode;
  playOnce: boolean;
  groups: GroupForExam[];
  /** mediaId → URL, lấy sẵn ở server qua getPlaybackUrl. */
  mediaUrls: Record<string, string>;
}

type Slot = { group: GroupForExam; question: QuestionForExam };

export function ExamRunner({
  attemptId,
  title,
  partNameJa,
  sectionLabel,
  timeLimitSec,
  navigationMode,
  playOnce,
  groups,
  mediaUrls,
}: ExamRunnerProps) {
  const router = useRouter();
  const slots: Slot[] = groups.flatMap((g) => g.questions.map((q) => ({ group: g, question: q })));

  const { currentIndex, answers, flagged, select, toggleFlag, setIndex, reset } = useExamSession();
  const [remaining, setRemaining] = useState(timeLimitSec);
  const [submitting, setSubmitting] = useState(false);

  const total = slots.length;
  const canGoTo = (to: number) => canNavigate(navigationMode, currentIndex, to, total);
  const goTo = (to: number) => {
    if (canGoTo(to)) setIndex(to);
  };

  // Dọn state của lượt trước khi mở một lượt mới.
  useEffect(() => {
    reset();
  }, [attemptId, reset]);

  useEffect(() => {
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const slot = slots[currentIndex];
  if (!slot) return null;
  const { group, question } = slot;
  const isLast = currentIndex === slots.length - 1;

  async function submit() {
    setSubmitting(true);
    // Gửi lựa chọn thô lên server. Server tự tra đáp án và chấm —
    // client không bao giờ biết câu nào đúng cho tới khi nộp xong.
    await fetch(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: slots.map((s) => ({
          questionId: s.question.id,
          selectedOptionId: answers[s.question.id] ?? null,
        })),
      }),
    });
    router.push(`/result/${attemptId}`);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    // Không header, không nav. Chỉ đồng hồ, dãy số câu, nút Thoát.
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg">
      <div className="relative flex h-[50px] flex-none items-center gap-4 border-b border-ln px-5">
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-(image:--g-line) opacity-45" />
        <span className="jp gt flex-none text-[13px] font-bold">{partNameJa}</span>
        <span className="flex-none text-[11.5px] text-fg3">{sectionLabel}</span>
        <span className="hidden flex-none text-[11.5px] text-fg3 xl:block">{title}</span>

        <div className="mx-auto flex flex-wrap gap-1" role="group" aria-label="Danh sách câu hỏi">
          {slots.map((s, i) => {
            const answered = Boolean(answers[s.question.id]);
            const isCurrent = i === currentIndex;
            const reachable = canGoTo(i) || isCurrent;
            return (
              <button
                key={s.question.id}
                type="button"
                onClick={() => goTo(i)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Câu ${i + 1}${answered ? ', đã trả lời' : ''}${flagged[s.question.id] ? ', đã đánh dấu' : ''}`}
                className={cn(
                  'grid size-[21px] place-items-center rounded-[5px] border text-[10px] tabular-nums',
                  'transition-transform duration-200',
                  reachable && 'hover:-translate-y-[3px]',
                  !reachable && 'cursor-default opacity-45',
                  isCurrent
                    ? 'border-transparent bg-(image:--g) font-bold text-on-g'
                    : answered
                      ? 'border-transparent bg-(image:--g-soft) text-acc-hi'
                      : 'border-ln text-fg3',
                  flagged[s.question.id] && 'shadow-[inset_0_-2px_0_var(--wr)]',
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="flex flex-none items-center gap-[7px] text-[15px] font-semibold">
          <FaClock className="size-3.5 text-acc" />
          <span className="tabular-nums">
            {mm}:{ss}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/practice')}
          className="ml-3.5 flex-none rounded-lg border border-ln px-3 py-1.5 text-[12.5px] transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
        >
          Thoát
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Tài liệu bên trái */}
        <div className="min-w-0 flex-[1.1] overflow-y-auto border-b border-ln p-6 lg:border-b-0 lg:border-r">
          {group.instructionJa && (
            <p className="jp mb-4 text-[13px] text-fg2">{group.instructionJa}</p>
          )}
          {group.materials.map((m) => (
            <MaterialView
              key={m.id}
              material={m}
              mediaUrl={m.mediaId ? mediaUrls[m.mediaId] : undefined}
              playOnce={playOnce}
              audioStartMs={playOnce ? null : question.audioStartMs}
              audioEndMs={playOnce ? null : question.audioEndMs}
            />
          ))}
        </div>

        {/* Câu hỏi bên phải */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
          <div className="mb-3 text-[11.5px] tabular-nums text-fg3">
            Câu {currentIndex + 1} / {slots.length}
          </div>
          <h1 className="jp mb-[18px] text-[17px] leading-[1.7]">{question.stemJa}</h1>

          <div role="radiogroup" aria-label="Phương án trả lời">
            {question.options.map((o) => {
              const chosen = answers[question.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  onClick={() => select(question.id, o.id)}
                  className="group relative flex w-full gap-3.5 rounded-lg border-b border-ln px-4 py-3.5 text-left first-of-type:border-t"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-0 rounded-lg bg-(image:--g-soft) transition-opacity duration-200',
                      chosen ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    )}
                  />
                  <span
                    className={cn(
                      'relative mt-px grid size-[23px] flex-none place-items-center rounded-md border text-[11px] tabular-nums',
                      'transition-colors duration-200',
                      chosen
                        ? 'border-transparent bg-(image:--g) font-bold text-on-g'
                        : 'border-ln text-fg3',
                    )}
                  >
                    {o.order}
                  </span>
                  <span className="jp relative">{o.textJa}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex gap-2.5 pt-5">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={!canGoTo(currentIndex - 1)}
              className="rounded-lg border border-ln px-4 py-2.5 text-[13.5px] transition-colors duration-200 hover:border-acc-dim hover:bg-ln2 disabled:pointer-events-none disabled:opacity-40"
              title={
                navigationMode === 'linear'
                  ? 'Đề thi thử không cho quay lại câu trước, giống kỳ thi thật'
                  : undefined
              }
            >
              Câu trước
            </button>
            <button
              type="button"
              onClick={() => toggleFlag(question.id)}
              aria-pressed={Boolean(flagged[question.id])}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13.5px] transition-colors duration-200',
                flagged[question.id]
                  ? 'border-wr text-wr'
                  : 'border-ln hover:border-acc-dim hover:bg-ln2',
              )}
            >
              <FaFlag className="size-3" />
              Đánh dấu
            </button>
            <button
              type="button"
              onClick={isLast ? submit : () => goTo(currentIndex + 1)}
              disabled={submitting}
              className="ml-auto rounded-lg bg-(image:--g) px-4 py-2.5 text-[13.5px] font-semibold text-on-g shadow-[0_4px_16px_rgba(35,150,232,.3)] transition-[filter] duration-200 hover:brightness-110 disabled:opacity-60"
            >
              {isLast ? (submitting ? 'Đang nộp…' : 'Nộp bài') : 'Câu tiếp theo'}
            </button>
          </div>

          {navigationMode === 'linear' && (
            <p className="mt-3 text-[11.5px] text-fg3">
              Đề thi thử mô phỏng kỳ thi thật: audio phát một lần và không quay lại câu trước được.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
