// This file is intentionally blank.
//
// The seed script was migrated to `scripts/supabase-seed.ts`.
// It used to crash on shutdown (`pool.end()` referenced an undeclared `pool`).
// Removing the implementation here means `pnpm prisma db seed` is a no-op
// until/unless a new seeder is wired into `prisma.config.ts`.
export {};
