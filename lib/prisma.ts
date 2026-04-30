import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL || "mysql://root:096096@localhost:3306/ikom_rental";
// Ensure allowPublicKeyRetrieval is set for mariadb driver to avoid RSA errors
const adapterUrl = connectionString.includes('?') 
  ? `${connectionString}&allowPublicKeyRetrieval=true` 
  : `${connectionString}?allowPublicKeyRetrieval=true`;
const adapter = new PrismaMariaDb(adapterUrl);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
