import { PrismaClient } from '@prisma/client';
import { getEnv } from './config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (getEnv('NODE_ENV') !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
