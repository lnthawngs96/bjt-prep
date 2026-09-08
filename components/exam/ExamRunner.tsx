'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaClock, FaFlag, FaLock } from 'react-icons/fa6';
import { MaterialView } from '@/components/common/MaterialView';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { handlePostAttemptSubmit } from '@/services/api/common/attemptsApi';
import { canNavigate, useExamSession } from '@/stores/exam/examSessionStore';
import { cn } from '@/lib/utils';
import type { ExamPart } from '@/lib/data/types';
import type { AttemptMode } from '@/lib/prisma-types';

export interface ExamRunnerProps {
  attemptId: string;
  title: string;
  mode: AttemptMode;
  playOnce: boolean;
  /** Các phần của màn thi, mỗi phần có đồng hồ và luật điều hướng riêng. */
  parts: ExamPart[];
  /** mediaId → URL, lấy sẵn ở server qua getPlaybackUrl. */
  mediaUrls: Record<string, string>;
  /** Về đâu khi bấm Thoát hoặc khi bị từ chối nộp. */
  exitHref: string;
}

/**
 * Màn làm bài. Không header, không nav. Chỉ đồng hồ, dãy số câu, nút Thoát.
 *
 * Mô phỏng CBT thật: mỗi PHẦN có đồng hồ riêng; hết giờ hoặc bấm "Kết thúc
 * phần" thì sang phần kế và phần cũ bị khoá. Trong phần nghe không lùi được,
 * trong phần đọc đi lại tự do. Luyện tập chỉ có một phần nên nhìn như cũ.
 */
export function ExamRunner({ attemptId, title, playOnce, parts, mediaUrls, exitHref }: ExamRunnerProps) {
  const router = useRouter();
  const toast = useToast();
  const { currentIndex, answers, flagged, select, toggleFlag, setIndex, reset } = useExamSession();

  const [partIndex, setPartIndex] = useState(0);
  const part = parts[partIndex];
  const slots = part?.slots ?? [];
  const total = slots.length;
  const isLastPart = partIndex === parts.length - 1;
  const multiPart = parts.length > 1;

  // Đồng hồ: render đầu tiên hiện đủ thời gian (server và client giống nhau),
  // mốc hết giờ đặt trong effect rồi tính ngược mỗi giây — không bị trôi.
  // Sang phần mới thì đặt lại NGAY TRONG RENDER (mẫu "state suy từ render
  // trước" của React) để không có khoảnh khắc nào đồng hồ của phần cũ, đang ở
  // 0, bị hiểu là hết giờ của phần mới.
  const [timer, setTimer] = useState({ partIndex: 0, remaining: parts[0]?.timeLimitSec ?? 0 });
  if (timer.partIndex !== partIndex) {
    setTimer({ partIndex, remaining: part?.timeLimitSec ?? 0 });
  }
  const remaining = timer.partIndex === partIndex ? timer.remaining : (part?.timeLimitSec ?? 0);
  const deadlineRef = useRef(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const submittedRef = useRef(false);
  const finishingRef = useRef(false);
  const finishPartRef = useRef<() => void>(() => {});

  // Dọn state của lượt trước khi mở một lượt mới.
  useEffect(() => {
    reset();
  }, [attemptId, reset]);

  // Mỗi khi sang phần mới: đặt mốc hết giờ và đếm ngược.
  useEffect(() => {
    if (!part) return;
    deadlineRef.current = Date.now() + part.timeLimitSec * 1000;
    finishingRef.current = false;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimer((t) => (t.partIndex === partIndex ? { ...t, remaining: left } : t));
    }, 500);
    return () => clearInterval(id);
  }, [part, partIndex]);

  const canGoTo = (to: number) => Boolean(part) && canNavigate(part.navigationMode, currentIndex, to, total);
  const goTo = (to: number) => {
    if (canGoTo(to)) setIndex(to);
  };

  async function submit() {
    // Chặn nộp hai lần: hết giờ và người dùng bấm Nộp bài có thể trùng nhau.
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    // Gửi lựa chọn thô của MỌI phần lên server. Server tự tra đáp án và chấm —
    // client không bao giờ biết câu nào đúng cho tới khi nộp xong.
    const result = await handlePostAttemptSubmit(attemptId, {
      answers: parts.flatMap((p) =>
        p.slots.map((s) => ({
          questionId: s.question.id,
          selectedOptionId: answers[s.question.id] ?? null,
        })),
      ),
    });

    // Đã nộp rồi (ví dụ bấm ở tab khác) — xem kết quả vẫn là đúng việc cần làm.
    if (result.ok || result.code === 'ALREADY_SUBMITTED') {
      router.push(`/result/${attemptId}`);
      return;
    }

    if (result.code === 'TIME_EXCEEDED') {
      toast('Đã quá thời gian làm bài, lượt này không được chấm.', 'wr');
      router.push(exitHref);
      return;
    }

    toast(
      result.code === 'NETWORK'
        ? 'Mất kết nối. Kiểm tra mạng rồi bấm Nộp bài lại.'
        : 'Không nộp được bài. Thử lại giúp tôi nhé.',
      'ng',
    );
    submittedRef.current = false;
    setSubmitting(false);
  }

  /** Kết thúc phần hiện tại: sang phần kế, hoặc nộp bài nếu là phần cuối. */
  function finishPart() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setConfirmEnd(false);
    if (isLastPart) {
      void submit();
      return;
    }
    setPartIndex((i) => i + 1);
    setIndex(0);
  }

  // Ref luôn trỏ tới bản mới nhất, để effect hết giờ gọi được mà không phải
  // đưa answers/parts vào dependency. Cập nhật trong effect chứ không phải lúc
  // render — render phải thuần.
  useEffect(() => {
    finishPartRef.current = finishPart;
  });

  // Hết giờ thì tự kết thúc phần. Kỳ thi thật không cho làm tiếp sau khi hết giờ.
  useEffect(() => {
    if (remaining === 0 && part) finishPartRef.current();
  }, [remaining, part]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  // Thoát sớm phải nằm sau mọi hook, nếu không thứ tự hook đổi giữa các render.
  const slot = slots[currentIndex];
  if (!part || !slot) return null;
  const { group, question } = slot;
  const isLastInPart = currentIndex === total - 1;
  // Phương án được đọc trong audio (L1, L2, LR1): màn hình chỉ có bốn con số.
  const spokenOptions = question.options.every((o) => !o.textJa);

  const primaryLabel = !isLastInPart
    ? 'Câu tiếp theo'
    : isLastPart
      ? submitting
        ? 'Đang nộp…'
        : 'Nộp bài'
      : `Kết thúc phần ${part.order}`;

  function onPrimary() {
    if (!isLastInPart) return goTo(currentIndex + 1);
    if (isLastPart) return void submit();
    setConfirmEnd(true);
  }

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-bg">
      <div className="relative flex h-12 flex-none items-center gap-4 border-b border-ln px-5">
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-(image:--g-line) opacity-45" />

        {multiPart ? (
          // Chỉ báo phần: đã xong · đang làm · còn khoá.
          <ol className="flex flex-none items-center gap-3" aria-label="Các phần của đề">
            {parts.map((p, i) => {
              const state = i < partIndex ? 'done' : i === partIndex ? 'current' : 'locked';
              return (
                <li
                  key={p.part}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={cn(
                    'jp flex items-center gap-1.5 text-sm',
                    state === 'current' ? 'gt font-bold' : 'text-fg3',
                  )}
                >
                  {state === 'done' && <FaCheck className="size-2.5 text-ok" aria-label="đã xong" />}
                  {state === 'locked' && <FaLock className="size-2.5" aria-label="chưa mở" />}
                  {p.nameJa}
                </li>
              );
            })}
          </ol>
        ) : (
          <span className="jp gt flex-none text-sm font-bold">{part.nameJa}</span>
        )}
        <span className="hidden flex-none text-xs text-fg3 xl:block">{title}</span>

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
                  'grid size-5 place-items-center rounded-sm border text-xs tabular-nums',
                  'transition-transform duration-200',
                  reachable && 'hover:-translate-y-0.75',
                  !reachable && 'cursor-default opacity-45',
                  isCurrent
                    ? 'border-transparent bg-(image:--g) font-bold text-on-g'
                    : answered
                      ? 'border-transparent bg-(image:--g-soft) text-acc-hi'
                      : 'border-ln text-fg3',
                  flagged[s.question.id] && 'shadow-flag',
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'flex flex-none items-center gap-2 text-base font-semibold',
            remaining <= 60 && 'text-ng',
          )}
          // Đọc lên khi còn một phút, rồi im để không làm phiền suốt hai tiếng.
          role={remaining <= 60 ? 'alert' : undefined}
        >
          <FaClock className={cn('size-3.5', remaining <= 60 ? 'text-ng' : 'text-acc')} />
          <span className="tabular-nums">
            {mm}:{ss}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push(exitHref)}
          className="ml-3.5 flex-none rounded-lg border border-ln px-3 py-1.5 text-xs transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
        >
          Thoát
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Tài liệu bên trái */}
        <div className="min-w-0 flex-1 overflow-y-auto border-b border-ln p-6 lg:border-b-0 lg:border-r">
          {group.instructionJa && (
            <p className="jp mb-4 text-sm text-fg2">{group.instructionJa}</p>
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
          <div className="mb-3 text-xs tabular-nums text-fg3">
            Câu {currentIndex + 1} / {total}
            {multiPart && ` · Phần ${part.order} / ${parts.length}`}
          </div>
          <h1 className="jp mb-4.5 text-lg leading-relaxed">{question.stemJa}</h1>

          {spokenOptions ? (
            <div role="radiogroup" aria-label="Phương án trả lời">
              <p className="mb-3 text-xs text-fg3">
                Các phương án được đọc trong audio. Chọn số của phương án đúng.
              </p>
              <div className="grid grid-cols-4 gap-3">
                {question.options.map((o) => {
                  const chosen = answers[question.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      aria-label={`Phương án ${o.order}`}
                      onClick={() => select(question.id, o.id)}
                      className={cn(
                        'grid aspect-square place-items-center rounded-lg border text-2xl font-semibold tabular-nums',
                        'transition-colors duration-200',
                        chosen
                          ? 'border-transparent bg-(image:--g) text-on-g'
                          : 'border-ln text-fg2 hover:border-acc-dim hover:bg-ln2',
                      )}
                    >
                      {o.order}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
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
                        'relative mt-px grid size-6 flex-none place-items-center rounded-md border text-xs tabular-nums',
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
          )}

          <div className="mt-auto flex gap-2.5 pt-5">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={!canGoTo(currentIndex - 1)}
              className="rounded-lg border border-ln px-4 py-2.5 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2 disabled:pointer-events-none disabled:opacity-40"
              title={
                part.navigationMode === 'linear'
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
                'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors duration-200',
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
              onClick={onPrimary}
              disabled={submitting || remaining === 0}
              className="ml-auto rounded-lg bg-(image:--g) px-4 py-2.5 text-sm font-semibold text-on-g shadow-btn-sm transition duration-200 hover:brightness-110 disabled:opacity-60"
            >
              {primaryLabel}
            </button>
          </div>

          {remaining === 0 && (
            <p className="mt-3 text-xs font-semibold text-ng" role="status">
              {isLastPart ? 'Hết giờ. Bài đang được nộp tự động.' : 'Hết giờ phần này. Đang chuyển sang phần kế.'}
            </p>
          )}

          {part.navigationMode === 'linear' && (
            <p className="mt-3 text-xs text-fg3">
              Đề thi thử mô phỏng kỳ thi thật: audio phát một lần và không quay lại câu trước được.
            </p>
          )}
        </div>
      </div>

      {/* Xác nhận kết thúc phần — sau bước này không quay lại được, giống CBT thật. */}
      <Modal open={confirmEnd} onClose={() => setConfirmEnd(false)} title={`Kết thúc phần ${part.order}`}>
        <div className="p-6">
          <p className="jp gt mb-1 text-xl font-bold">{part.nameJa}</p>
          <p className="mb-2 text-base font-medium">Kết thúc phần {part.order}?</p>
          <p className="mb-6 text-sm text-fg2">
            Giống kỳ thi thật, sau khi sang phần {part.order + 1} bạn sẽ không quay lại phần này được
            nữa. Thời gian còn lại của phần này không được cộng dồn.
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className="rounded-lg border border-ln px-4 py-2.5 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
            >
              Ở lại
            </button>
            <button
              type="button"
              onClick={finishPart}
              className="rounded-lg bg-(image:--g) px-4 py-2.5 text-sm font-semibold text-on-g transition duration-200 hover:brightness-110"
            >
              Sang phần {part.order + 1}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
