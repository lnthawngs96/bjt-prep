import type { Metadata } from 'next';
import { getDueVocabCards } from '@/lib/data/vocab';
import { Flashcards } from './Flashcards';

export const metadata: Metadata = { title: 'Ôn từ vựng' };

export default async function VocabReviewPage() {
  const cards = await getDueVocabCards(20);

  return (
    <div className="mx-auto max-w-[680px] px-6 pt-12">
      <h1 className="mb-2 text-[24px] font-bold tracking-[-.03em]">Ôn từ đến hạn</h1>
      <p className="mb-8 text-[13px] text-fg2">
        Lịch ôn tính bằng FSRS — chỉ ôn đúng thứ sắp quên, không ôn lại thứ đã nhớ chắc.
      </p>
      <Flashcards cards={cards} />
      <div className="h-40" />
    </div>
  );
}
