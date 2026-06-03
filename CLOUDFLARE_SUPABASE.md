Cloudflare + Supabase deployment notes

Goal
- Deploy this Next.js app to Cloudflare Pages/Workers with only Supabase as the backend provider.

Required environment variables (Cloudflare Pages/Workers -> Settings -> Variables & secrets)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- DATABASE_URL (if you need server DB connections)
- BETTER_AUTH_SECRET (if using Better Auth), BETTER_AUTH_URL
- Any OAuth client secrets you need (Google Client ID/Secret)

Quick steps to prepare repo
1. Create branch for work: `cloudflare-supabase` (done by the maintainer script).
2. Verify `package.json` has the `build` script: `next build && pnpm exec cloudflare` (already present).
3. Ensure `wrangler.toml` has `pages_build_output_dir = ".worker-next"` (project already uses this).
4. Add required env vars in Cloudflare Pages project settings before deploying.

Optional: prune unused dependencies
- Review `package.json` and remove packages not needed for Supabase-only build. Common candidates (verify code before removing):
  - `mongodb`, `mongoose`
  - `@aws-sdk/*`, `aws-crt`
  - `stripe`, `stripe` related packages
  - `nodemailer`, `resend`, `mailparser`
  - `mcp-handler`, `better-auth` (only if you don't use them)

Example pnpm remove command (run locally then build/test):
```bash
pnpm remove mongodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner aws-crt stripe nodemailer resend mcp-handler
pnpm install --no-frozen-lockfile
pnpm build
```

Notes and safety
- Removing a dependency that the code imports will break the build; test locally before pushing to main.
- We pushed an updated `pnpm-lock.yaml` to `main` to fix CI frozen-lockfile errors.

Cloudflare deploy
- After adding env vars in Pages dashboard, trigger a deploy (push to `main` or deploy from the Pages UI). The committed lockfile prevents `frozen-lockfile` failures.

If you want, I can:
- (A) Create the `cloudflare-supabase` branch and push this file (I'm about to do that).
- (B) Attempt to remove specific packages and run the build here (I can do that if you confirm which packages to drop).
- (C) Generate a minimal `.env.example` showing only the Supabase vars.

Tell me which option to proceed with (A/B/C) or provide the exact packages to remove and I'll prune+build and push the branch with the cleaned `pnpm-lock.yaml`.