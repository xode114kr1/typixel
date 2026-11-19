import { getPrisma } from "../src/lib/prisma";

/** Prisma로 연결을 확인하고 검증이 끝나면 연결을 닫는다. */
async function checkDatabase() {
  const prisma = getPrisma();

  try {
    const [result] = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`;
    if (result?.result !== 1) throw new Error("Unexpected response from PostgreSQL.");

    console.log("PostgreSQL connection verified: SELECT 1 returned 1.");
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("Database connection check failed:", message);
  process.exitCode = 1;
});
