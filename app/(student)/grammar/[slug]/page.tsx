import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeading } from '@/components/common/SectionHeading';
import { getGrammarBySlug } from '@/lib/data/grammar';

const REGISTER_LABEL: Record<string, string> = {
  SONKEIGO: '尊敬語 · Tôn kính',
  KENJOUGO: '謙譲語 · Khiêm nhường',
  TEINEIGO: '丁寧語 · Lịch sự',
  PLAIN: 'Thể thường',
  WRITTEN: 'Văn viết',
};

export async function generateMetadata({
  params,
}: PageProps<'/grammar/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGrammarBySlug(slug);
  return { title: g ? g.pattern : 'Ngữ pháp' };
}

export default async function GrammarDetailPage({ params }: PageProps<'/grammar/[slug]'>) {
  const { slug } = await params;
  const g = await getGrammarBySlug(slug);
  if (!g) notFound();

  const good = g.examples.filter((e) => !e.isNegative);
  const bad = g.examples.filter((e) => e.isNegative);

  return (
    <>
      <section className="relative px-6 py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-50 -top-14 bottom-0 bg-(image:--glow)"
        />
        <Link href="/grammar" className="relative mb-5 block text-xs text-fg3 hover:text-fg">
          ← Ngữ pháp
        </Link>
        <h1 className="jp gt relative mb-4 text-5xl font-bold leading-tight">{g.pattern}</h1>
        <p className="relative mb-4 text-lg">{g.meaningVi}</p>
        <div className="relative flex flex-wrap gap-2">
          <Badge tone="gradient">{g.level.replace('_PLUS', '+')}</Badge>
          <Badge tone="neutral">
            <span className="jp">{REGISTER_LABEL[g.register] ?? g.register}</span>
          </Badge>
          {g.jlptLevel && <Badge tone="neutral">JLPT {g.jlptLevel}</Badge>}
        </div>
      </section>

      <Section>
        <SectionHeading title="Cách cấu tạo" />
        <p className="jp text-lg">{g.formation}</p>
      </Section>

      {g.usageNoteVi && (
        <Section>
          <SectionHeading title="Dùng khi nào" />
          <p className="max-w-prose text-sm leading-relaxed text-fg2">{g.usageNoteVi}</p>
        </Section>
      )}

      {g.commonMistakeVi && (
        <Section>
          <SectionHeading title="Lỗi người Việt hay mắc" />
          <p className="max-w-prose border-l-2 border-l-ng pl-4 text-sm leading-relaxed text-fg2">
            {g.commonMistakeVi}
          </p>
        </Section>
      )}

      {/* Ví dụ đúng và ví dụ SAI đặt cạnh nhau — isNegative trong schema là để làm việc này. */}
      <Section>
        <SectionHeading title="Ví dụ" meta={`${good.length} đúng · ${bad.length} sai`} />
        <div className="flex flex-wrap gap-x-12 gap-y-8">
          <div className="min-w-70 flex-1">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold text-ok">
              <FaCheck className="size-3" /> DÙNG ĐÚNG
            </p>
            <div className="space-y-5">
              {good.map((e) => (
                <div key={e.id}>
                  <p className="jp text-sm leading-loose">{e.sentenceJa}</p>
                  <p className="mt-1 text-xs text-fg2">{e.meaningVi}</p>
                  {e.noteVi && <p className="mt-2 text-xs text-fg3">{e.noteVi}</p>}
                </div>
              ))}
            </div>
          </div>

          {bad.length > 0 && (
            <div className="min-w-70 flex-1">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold text-ng">
                <FaXmark className="size-3" /> DÙNG SAI
              </p>
              <div className="space-y-5">
                {bad.map((e) => (
                  <div key={e.id}>
                    <p className="jp text-sm leading-loose line-through decoration-ng/50">
                      {e.sentenceJa}
                    </p>
                    <p className="mt-1 text-xs text-fg2">{e.meaningVi}</p>
                    {e.noteVi && (
                      <p className="mt-2 border-l-2 border-l-ng pl-3 text-xs text-fg2">{e.noteVi}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <div className="h-40" />
    </>
  );
}
