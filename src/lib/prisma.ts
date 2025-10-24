import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === "production";
const directUrl = process.env.DATABASE_URL;
const poolerUrl = process.env.DATABASE_URL_POOLER;
const selectedUrl = isProd ? (poolerUrl || directUrl) : directUrl;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: selectedUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;