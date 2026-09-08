import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ScoreRuler } from '@/components/common/ScoreRuler';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeading } from '@/components/common/SectionHeading';
import { getAttemptResult } from '@/lib/data/attempts';
import { getPlaybackUrl } from '@/lib/data/media';
import { getSession } from '@/lib/auth-server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Kết quả' };

export default async function ResultPage({ params }: PageProps<'/result/[attemptId]'>) {
  const { attemptId } = await params;

  // Kết quả là của một người: chưa đăng nhập thì đi đăng nhập, không phải chủ thì 404.
  const session = await getSession();
  if (!session) redirect(`/login?next=/result/${attemptId}`);

  const result = await getAttemptResult(attemptId, session.user.id);
  if (!result) notFound();

  const { attempt, items, estimatedScore, estimatedLevel } = result;
  const wrong = items.filter((i) => !i.isCorrect);
  const accuracy = attempt.totalQuestions > 0 ? attempt.rawCorrect / attempt.totalQuestions : 0;

  // Audio để phát lại đúng đoạn liên quan tới câu sai.
  const audioUrls: Record<string, string> = Object.fromEntries(
    await Promise.all(
      [
        ...new Set(
          items.flatMap((i) =>
            i.materials.flatMap((m) => (m.kind === 'AUDIO' && m.mediaId ? [m.mediaId] : [])),
          ),
        ),
      ].map(async (id) => [id, await getPlaybackUrl(id)] as const),
    ),
  );

  return (
    <>
      {/* ---------- Điểm ---------- */}
      <section className="relative px-6 py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-50 -top-14 bottom-0 bg-(image:--glow)"
        />
        <div className="gt relative mb-3.5 text-xs font-bold">Kết quả</div>
        <div className="relative flex flex-wrap items-end gap-5">
          <span className="gt text-6xl font-bold leading-none tabular-nums">
            {attempt.rawCorrect}/{attempt.totalQuestions}
          </span>
          <span className="pb-3 text-base text-fg2">
            {Math.round(accuracy * 100)}% đúng
            {wrong.length > 0 && ` · ${wrong.length} câu cần xem lại`}
          </span>
        </div>

        {estimatedScore != null ? (
          <div className="relative mt-8">
            <ScoreRuler score={estimatedScore} />
            <p className="mt-4 text-xs text-fg3">
              <b className="font-semibold text-fg2">Điểm tham khảo</b> {estimatedScore}/800, bậc{' '}
              {estimatedLevel?.replace('_PLUS', '+')}. Tính 10 điểm mỗi câu — BJT thật chấm bằng IRT
              và không công bố 配点.
            </p>
          </div>
        ) : (
          <p className="relative mt-6 max-w-prose text-xs text-fg3">
            Bộ luyện tập không quy ra thang 800. Ngoại suy từ {attempt.totalQuestions} câu sẽ làm điểm
            dao động hàng trăm đơn vị chỉ vì đoán trúng một câu. Chỉ đề thi thử đủ 80 câu mới có điểm
            tham khảo.
          </p>
        )}
      </section>

      {/* ---------- Từng câu ---------- */}
      <Section>
        <SectionHeading
          title={wrong.length > 0 ? 'Những câu cần xem lại' : 'Xem lại toàn bộ'}
          meta={`${items.length} câu`}
        />

        <div className="flex flex-col gap-10">
          {items.map((item, idx) => {
            const { question } = item;
            const correctOption = question.options.find((o) => o.isCorrect);
            const chosen = question.options.find((o) => o.id === item.selectedOptionId);
            const audio = item.materials.find((m) => m.kind === 'AUDIO');

            const head = (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs tabular-nums text-fg3">Câu {idx + 1}</span>
                {item.isCorrect ? (
                  <Badge tone="ok">
                    <FaCheck className="mr-1.5 size-2.5" /> Đúng
                  </Badge>
                ) : (
                  <Badge tone="ng">
                    <FaXmark className="mr-1.5 size-2.5" />
                    {chosen ? 'Sai' : 'Bỏ trống'}
                  </Badge>
                )}
                {item.tags.map((t) => (
                  <span key={t.id} className="text-xs text-fg3">
                    {t.nameVi}
                  </span>
                ))}
              </div>
            );

            const body = (
              <>
                <h3 className="jp mb-1 text-base leading-relaxed">{question.stemJa}</h3>
                {question.stemVi && <p className="mb-4 text-sm text-fg2">{question.stemVi}</p>}

                {/* Phát lại ĐÚNG đoạn audio của câu này */}
                {audio?.mediaId && audioUrls[audio.mediaId] && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-fg3">
                      Nghe lại đoạn liên quan
                      {question.audioStartMs != null &&
                        ` (${fmt(question.audioStartMs)} → ${fmt(question.audioEndMs ?? 0)})`}
                    </p>
                    <AudioPlayer
                      src={audioUrls[audio.mediaId]}
                      waveform={
                        Array.isArray(audio.media?.waveform) ? (audio.media.waveform as number[]) : null
                      }
                      startMs={question.audioStartMs}
                      endMs={question.audioEndMs}
                    />
                  </div>
                )}

                {/* Bốn phương án, kèm vì sao ba cái kia sai */}
                <ol className="mb-4">
                  {question.options.map((o) => {
                    const isChosen = o.id === item.selectedOptionId;
                    return (
                      <li
                        key={o.id}
                        className={cn(
                          'flex gap-3.5 border-b border-ln px-3 py-3 first:border-t',
                          o.isCorrect && 'bg-ok-soft/40',
                          isChosen && !o.isCorrect && 'bg-ng-soft/40',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-px grid size-6 flex-none place-items-center rounded-md border text-xs tabular-nums',
                            o.isCorrect && 'border-transparent bg-ok font-bold text-white',
                            isChosen && !o.isCorrect && 'border-transparent bg-ng font-bold text-white',
                            !o.isCorrect && !isChosen && 'border-ln text-fg3',
                          )}
                        >
                          {o.order}
                        </span>
                        <div className="min-w-0">
                          <p className={cn('text-sm', o.textJa ? 'jp' : 'text-fg3')}>
                            {o.textJa ?? 'Phương án được đọc trong audio'}
                            {isChosen && (
                              <span className="jp-none ml-2 text-xs text-fg3">— bạn chọn</span>
                            )}
                          </p>
                          {o.distractorNote && (
                            <p className="mt-1 text-xs leading-relaxed text-fg2">
                              {o.distractorNote}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {question.explanationVi && (
                  <Note label="Vì sao đáp án đúng" accent>
                    {question.explanationVi}
                  </Note>
                )}
                {question.businessNoteVi && (
                  <Note label="Bối cảnh công sở cần biết">{question.businessNoteVi}</Note>
                )}

                {(item.vocabToReview.length > 0 || item.grammarToReview.length > 0) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ln pt-4">
                    <span className="text-xs font-bold text-fg2">Cần ôn</span>
                    {item.vocabToReview.map((v) => (
                      <Link
                        key={v.id}
                        href="/vocabulary"
                        className="jp rounded-sm bg-(image:--g-soft) px-2 py-0.5 text-xs text-acc-hi"
                      >
                        {v.headword}
                      </Link>
                    ))}
                    {item.grammarToReview.map((g) => (
                      <Link
                        key={g.id}
                        href={`/grammar/${g.slug}`}
                        className="jp rounded-sm bg-(image:--g-soft) px-2 py-0.5 text-xs text-acc-hi"
                      >
                        {g.pattern}
                      </Link>
                    ))}
                  </div>
                )}

                {correctOption && !item.isCorrect && !question.explanationVi && (
                  <p className="text-xs text-fg3">
                    Đáp án đúng là phương án {correctOption.order}.
                  </p>
                )}
              </>
            );

            // Câu làm đúng thu gọn lại. Sau khi nộp bài, thứ đáng đọc là câu SAI —
            // mở sẵn cả mười câu chỉ tạo ra một bức tường chữ và chôn mất phần
            // quan trọng. Dùng <details> gốc nên không cần JavaScript.
            if (item.isCorrect) {
              return (
                <details
                  key={question.id}
                  className="group border-t border-ln pt-6 first:border-t-0 first:pt-0"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                    {head}
                    <span className="jp min-w-0 flex-1 truncate text-sm text-fg2">
                      {question.stemJa}
                    </span>
                    <span className="flex-none text-xs text-acc-hi group-open:hidden">
                      Xem lại
                    </span>
                    <span className="hidden flex-none text-xs text-fg3 group-open:block">
                      Thu gọn
                    </span>
                  </summary>
                  <div className="pt-4">{body}</div>
                </details>
              );
            }

            return (
              <article key={question.id} className="border-t border-ln pt-6 first:border-t-0 first:pt-0">
                <div className="mb-3">{head}</div>
                {body}
              </article>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-(image:--g) px-7 py-3.5 text-sm font-semibold text-on-g shadow-btn transition duration-200 hover:brightness-110"
          >
            Làm bộ tiếp theo
          </Link>
          <Link
            href="/vocabulary/review"
            className="rounded-lg border border-ln px-7 py-3.5 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
          >
            Ôn từ vừa gặp
          </Link>
        </div>
      </Section>

      <div className="h-40" />
    </>
  );
}

function Note({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mt-3 border-l-2 pl-4', accent ? 'border-l-acc' : 'border-l-ln')}>
      <p className="mb-1 text-xs font-bold text-fg2">{label}</p>
      <p className="text-sm leading-relaxed text-fg2">{children}</p>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
