-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'credentials',
ADD COLUMN     "providerAccountId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
