import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Graceful shutdown — release connection pool on process exit
async function disconnect() {
  await prisma.$disconnect();
}
process.on('SIGTERM', disconnect);
process.on('SIGINT',  disconnect);

export default prisma;
