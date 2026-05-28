import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Add a PostgreSQL database in Railway and link it to this service.');
    }
    _prisma = new PrismaClient();
  }
  return _prisma;
}

// Convenience getter — throws clear error if DB not configured
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});
