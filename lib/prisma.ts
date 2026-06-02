import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

// Prisma Client configuration with connection pooling and lifecycle management
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;
  console.log("[PRISMA INIT] DATABASE_URL in process.env is:", process.env.DATABASE_URL ? "DEFINED" : "UNDEFINED", "Value length:", process.env.DATABASE_URL?.length);
  console.log("[PRISMA INIT] Connection string being passed to Pool:", connectionString);
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Ensure graceful shutdown on hot reload in development
  if (process.env.NODE_ENV !== "production") {
    // Clean up on process termination
    const cleanup = async () => {
      await client.$disconnect();
    };

    process.on("beforeExit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }

  return client;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = prismaClientSingleton();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = prismaClientSingleton();
  }
  prisma = global.cachedPrisma;
}

export const prismadb = prisma;

export function withTenant(tenantId: string) {
  return prismadb.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Check if model has tenantId field
          const hasTenantId = [
            "crm_Accounts",
            "crm_Contacts",
            "crm_Opportunities",
            "crm_Leads",
            "crm_Contracts",
            "crm_Products",
            "crm_Targets",
            "campaigns",
            "projects",
            "invoices"
          ].includes(model);

          if (hasTenantId) {
            // Force tenantId filter
            args.where = { ...args.where, tenantId };

            // If creating, force tenantId in data
            if ((operation as string) === "create" || (operation as string) === "createMany") {
              if (Array.isArray((args as any).data)) {
                (args as any).data = (args as any).data.map((d: any) => ({ ...d, tenantId }));
              } else {
                (args as any).data = { ...(args as any).data, tenantId };
              }
            }
          }

          return query(args);
        },
      },
    },
  });
}
