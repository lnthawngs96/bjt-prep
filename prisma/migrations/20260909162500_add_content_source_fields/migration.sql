-- Nguồn tham khảo của nội dung soạn theo sách.
-- sourceKey trỏ tới constants/common/contentSources.ts, sourceLocator là vị trí
-- trong sách. Xem docs/sources.md.
-- Cả hai đều nullable nên migration này không đụng dữ liệu sẵn có.

-- AlterTable
ALTER TABLE "QuestionGroup" ADD COLUMN     "sourceKey" TEXT,
ADD COLUMN     "sourceLocator" TEXT;

-- AlterTable
ALTER TABLE "VocabEntry" ADD COLUMN     "sourceKey" TEXT,
ADD COLUMN     "sourceLocator" TEXT;

-- AlterTable
ALTER TABLE "GrammarPoint" ADD COLUMN     "sourceKey" TEXT,
ADD COLUMN     "sourceLocator" TEXT;
