import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully!");

    const result = await prisma.$queryRaw`SELECT NOW();`;
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();