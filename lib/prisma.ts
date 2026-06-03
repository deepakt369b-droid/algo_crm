/**
 * Prisma compatibility shim
 *
 * This file exists so that test files which previously mocked prismadb
 * via `jest.mock("@/lib/prisma", ...)` can still resolve the module.
 * The production code no longer uses Prisma — all queries have been
 * migrated to `supabaseAdmin` in `@/lib/supabase-admin`.
 *
 * The exported `prismadb` object will never be used at runtime in
 * production; it's only present so that test mock factories work.
 */

function createProxy(): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined; // not a Promise
        // Return another proxy so deeply nested chains don't crash
        return createProxy();
      },
    }
  );
}

export const prismadb = createProxy();
