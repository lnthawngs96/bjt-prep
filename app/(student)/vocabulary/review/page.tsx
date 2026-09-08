import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDueVocabCards } from '@/lib/data/vocab';
import { getSession } from '@/lib/auth-server';
import { VocabularyFlashcards } from '@/components/vocabulary/VocabularyFlashcards';

export const metadata: Metadata = { title: 'Ôn từ vựng' };

export default async function VocabReviewPage() {
  // Hàng đợi ôn là của từng người — chưa đăng nhập thì không có gì để ôn.
  const session = await getSession();
  if (!session) redirect('/login?next=/vocabulary/review');

  const cards = await getDueVocabCards(session.user.id, 20);

  return (
    <div className="mx-auto max-w-170 px-6 pt-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Ôn từ đến hạn</h1>
      <p className="mb-8 text-sm text-fg2">
        Lịch ôn tính bằng FSRS — chỉ ôn đúng thứ sắp quên, không ôn lại thứ đã nhớ chắc.
      </p>
      <VocabularyFlashcards cards={cards} />
      <div className="h-40" />
    </div>
  );
}
