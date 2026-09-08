-- CreateEnum
CREATE TYPE "Part" AS ENUM ('LISTENING', 'LISTENING_READING', 'READING');

-- CreateEnum
CREATE TYPE "SectionCode" AS ENUM ('L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3', 'R1', 'R2', 'R3');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('J5', 'J4', 'J3', 'J2', 'J1', 'J1_PLUS');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'NEEDS_AUDIO', 'NEEDS_REVIEW', 'PUBLISHED', 'FLAGGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MaterialKind" AS ENUM ('AUDIO', 'DOCUMENT', 'IMAGE', 'TABLE', 'CHART');

-- CreateEnum
CREATE TYPE "Register" AS ENUM ('SONKEIGO', 'KENJOUGO', 'TEINEIGO', 'PLAIN', 'WRITTEN');

-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'VERB_U', 'VERB_RU', 'VERB_IRR', 'I_ADJ', 'NA_ADJ', 'ADVERB', 'EXPRESSION', 'COUNTER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('PRACTICE', 'MOCK', 'REVIEW', 'WEAKNESS');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('VOCAB', 'GRAMMAR');

-- CreateEnum
CREATE TYPE "SrsState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateTable
CREATE TABLE "PartDef" (
    "code" "Part" NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "timeLimitSec" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PartDef_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "SectionDef" (
    "code" "SectionCode" NOT NULL,
    "part" "Part" NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "hasAudio" BOOLEAN NOT NULL DEFAULT false,
    "hasMaterial" BOOLEAN NOT NULL DEFAULT false,
    "descriptionVi" TEXT,

    CONSTRAINT "SectionDef_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "durationMs" INTEGER,
    "checksum" TEXT,
    "waveform" JSONB,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "kind" "MaterialKind" NOT NULL,
    "titleAdmin" TEXT NOT NULL,
    "mediaId" TEXT,
    "transcript" JSONB,
    "body" JSONB,
    "altText" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionGroup" (
    "id" TEXT NOT NULL,
    "sectionCode" "SectionCode" NOT NULL,
    "level" "Level" NOT NULL,
    "titleAdmin" TEXT NOT NULL,
    "instructionJa" TEXT,
    "instructionVi" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMaterial" (
    "groupId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GroupMaterial_pkey" PRIMARY KEY ("groupId","materialId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sectionCode" "SectionCode" NOT NULL,
    "level" "Level" NOT NULL,
    "stemJa" TEXT NOT NULL,
    "stemFurigana" JSONB,
    "stemVi" TEXT,
    "audioStartMs" INTEGER,
    "audioEndMs" INTEGER,
    "explanationVi" TEXT,
    "businessNoteVi" TEXT,
    "correctRate" DOUBLE PRECISION,
    "discrimination" DOUBLE PRECISION,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "textJa" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "distractorNote" TEXT,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "sectionCode" "SectionCode" NOT NULL,
    "level" "Level" NOT NULL,
    "indexNo" INTEGER NOT NULL,
    "titleVi" TEXT NOT NULL,
    "descVi" TEXT,
    "estMinutes" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSetItem" (
    "setId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuestionSetItem_pkey" PRIMARY KEY ("setId","groupId")
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleVi" TEXT NOT NULL,
    "descVi" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestItem" (
    "mockTestId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "sectionCode" "SectionCode" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "MockTestItem_pkey" PRIMARY KEY ("mockTestId","groupId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameJa" TEXT,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("questionId","tagId")
);

-- CreateTable
CREATE TABLE "VocabTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameJa" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VocabTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabEntry" (
    "id" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "readingKana" TEXT NOT NULL,
    "accent" INTEGER,
    "pos" "PartOfSpeech" NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "meaningEn" TEXT,
    "level" "Level" NOT NULL,
    "topicId" TEXT,
    "register" "Register",
    "audioId" TEXT,
    "noteVi" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabExample" (
    "id" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "sentenceJa" TEXT NOT NULL,
    "sentenceKana" TEXT,
    "meaningVi" TEXT NOT NULL,
    "contextTag" TEXT,
    "audioId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VocabExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabRelation" (
    "vocabId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,

    CONSTRAINT "VocabRelation_pkey" PRIMARY KEY ("vocabId","relatedId","relation")
);

-- CreateTable
CREATE TABLE "GrammarPoint" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "register" "Register" NOT NULL,
    "level" "Level" NOT NULL,
    "usageNoteVi" TEXT,
    "commonMistakeVi" TEXT,
    "jlptLevel" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarExample" (
    "id" TEXT NOT NULL,
    "grammarId" TEXT NOT NULL,
    "sentenceJa" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "contextTag" TEXT,
    "isNegative" BOOLEAN NOT NULL DEFAULT false,
    "noteVi" TEXT,
    "audioId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrammarExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVocab" (
    "questionId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,

    CONSTRAINT "QuestionVocab_pkey" PRIMARY KEY ("questionId","vocabId")
);

-- CreateTable
CREATE TABLE "QuestionGrammar" (
    "questionId" TEXT NOT NULL,
    "grammarId" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,

    CONSTRAINT "QuestionGrammar_pkey" PRIMARY KEY ("questionId","grammarId")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "locale" TEXT NOT NULL DEFAULT 'vi',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "targetLevel" "Level",
    "examDate" TIMESTAMP(3),
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 20,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SrsCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "refId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" "SrsState" NOT NULL DEFAULT 'NEW',
    "lastReviewAt" TIMESTAMP(3),

    CONSTRAINT "SrsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SrsReview" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "durationMs" INTEGER,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SrsReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "AttemptMode" NOT NULL,
    "questionSetId" TEXT,
    "mockTestId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "timeSpentSec" INTEGER,
    "rawCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL,
    "estimatedScore" INTEGER,
    "estimatedLevel" "Level",
    "perSection" JSONB,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentMs" INTEGER,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillStat" (
    "userId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillStat_pkey" PRIMARY KEY ("userId","dimension","key")
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "rules" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringBand" (
    "level" "Level" NOT NULL,
    "minScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ScoringBand_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "QuestionReport" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_r2Key_key" ON "MediaAsset"("r2Key");

-- CreateIndex
CREATE INDEX "Material_kind_status_idx" ON "Material"("kind", "status");

-- CreateIndex
CREATE INDEX "QuestionGroup_sectionCode_level_status_idx" ON "QuestionGroup"("sectionCode", "level", "status");

-- CreateIndex
CREATE INDEX "Question_sectionCode_level_status_idx" ON "Question"("sectionCode", "level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Question_groupId_order_key" ON "Question"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_order_key" ON "QuestionOption"("questionId", "order");

-- CreateIndex
CREATE INDEX "QuestionSet_sectionCode_level_status_idx" ON "QuestionSet"("sectionCode", "level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSet_sectionCode_indexNo_key" ON "QuestionSet"("sectionCode", "indexNo");

-- CreateIndex
CREATE UNIQUE INDEX "MockTest_code_key" ON "MockTest"("code");

-- CreateIndex
CREATE INDEX "MockTestItem_mockTestId_sectionCode_order_idx" ON "MockTestItem"("mockTestId", "sectionCode", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "QuestionTag_tagId_idx" ON "QuestionTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "VocabTopic_slug_key" ON "VocabTopic"("slug");

-- CreateIndex
CREATE INDEX "VocabEntry_topicId_level_status_idx" ON "VocabEntry"("topicId", "level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VocabEntry_headword_readingKana_key" ON "VocabEntry"("headword", "readingKana");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarPoint_slug_key" ON "GrammarPoint"("slug");

-- CreateIndex
CREATE INDEX "GrammarPoint_level_register_status_idx" ON "GrammarPoint"("level", "register", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "SrsCard_userId_dueAt_idx" ON "SrsCard"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "SrsCard_userId_cardType_refId_key" ON "SrsCard"("userId", "cardType", "refId");

-- CreateIndex
CREATE INDEX "SrsReview_userId_reviewedAt_idx" ON "SrsReview"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "Attempt_userId_startedAt_idx" ON "Attempt"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Attempt_userId_mode_finishedAt_idx" ON "Attempt"("userId", "mode", "finishedAt");

-- CreateIndex
CREATE INDEX "AttemptAnswer_questionId_idx" ON "AttemptAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "AttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "UserSkillStat_userId_accuracy_idx" ON "UserSkillStat"("userId", "accuracy");

-- CreateIndex
CREATE INDEX "QuestionReport_status_createdAt_idx" ON "QuestionReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "SectionDef" ADD CONSTRAINT "SectionDef_part_fkey" FOREIGN KEY ("part") REFERENCES "PartDef"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGroup" ADD CONSTRAINT "QuestionGroup_sectionCode_fkey" FOREIGN KEY ("sectionCode") REFERENCES "SectionDef"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMaterial" ADD CONSTRAINT "GroupMaterial_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMaterial" ADD CONSTRAINT "GroupMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSet" ADD CONSTRAINT "QuestionSet_sectionCode_fkey" FOREIGN KEY ("sectionCode") REFERENCES "SectionDef"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSetItem" ADD CONSTRAINT "QuestionSetItem_setId_fkey" FOREIGN KEY ("setId") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSetItem" ADD CONSTRAINT "QuestionSetItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestItem" ADD CONSTRAINT "MockTestItem_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestItem" ADD CONSTRAINT "MockTestItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabEntry" ADD CONSTRAINT "VocabEntry_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "VocabTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabEntry" ADD CONSTRAINT "VocabEntry_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabExample" ADD CONSTRAINT "VocabExample_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabExample" ADD CONSTRAINT "VocabExample_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabRelation" ADD CONSTRAINT "VocabRelation_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabRelation" ADD CONSTRAINT "VocabRelation_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "VocabEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExample" ADD CONSTRAINT "GrammarExample_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES "GrammarPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExample" ADD CONSTRAINT "GrammarExample_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVocab" ADD CONSTRAINT "QuestionVocab_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVocab" ADD CONSTRAINT "QuestionVocab_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGrammar" ADD CONSTRAINT "QuestionGrammar_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGrammar" ADD CONSTRAINT "QuestionGrammar_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES "GrammarPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SrsCard" ADD CONSTRAINT "SrsCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SrsReview" ADD CONSTRAINT "SrsReview_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "SrsCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SrsReview" ADD CONSTRAINT "SrsReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillStat" ADD CONSTRAINT "UserSkillStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
