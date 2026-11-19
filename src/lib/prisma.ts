import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { typixelPrisma?: PrismaClient };
let prisma = globalForPrisma.typixelPrisma;

/** 서버에서 처음 필요할 때 Client를 만들고, 개발 중 코드가 다시 로드돼도 재사용한다. */
export function getPrisma() {
  if (prisma) return prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");

  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.typixelPrisma = prisma;

  return prisma;
}
