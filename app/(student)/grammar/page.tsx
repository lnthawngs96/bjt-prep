import type { Metadata } from 'next';
import { getGrammarPoints } from '@/lib/data/grammar';
import { GrammarBrowser } from '@/components/grammar/GrammarBrowser';

export const metadata: Metadata = { title: 'Ngữ pháp' };

export default async function GrammarPage() {
  const points = await getGrammarPoints();

  return (
    <div className="mx-auto max-w-content px-6 pt-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Ngữ pháp</h1>
        <p className="max-w-prose text-sm text-fg2">
          Mẫu ngữ pháp thương mại, lọc theo mức độ và tầng lịch sự. Mỗi mẫu có ví dụ dùng đúng đặt
          cạnh ví dụ dùng sai — học kính ngữ mà không thấy ví dụ sai thì rất khó nhớ.
        </p>
      </div>
      <GrammarBrowser points={points} />
      <div className="h-40" />
    </div>
  );
}
