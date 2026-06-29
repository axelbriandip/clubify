import { PrismaClient } from "@prisma/client";

// Evita crear múltiples instancias de Prisma Client en desarrollo durante el Hot Reloading
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
