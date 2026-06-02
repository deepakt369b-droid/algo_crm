# Get Shit Done (GSD) State Record

**Last Updated**: 2026-05-30 17:15:00+04:00

---

## 1. Application Status
- **Dev Server**: Running locally on [http://localhost:3000](http://localhost:3000).
- **Convex Dev Server**: Running locally on port `3212` / `3213` (Background Task `task-111`), providing host-running local database and UDF synchronization with HTTP actions enabled.
- **Database**: PostgreSQL with `pgvector` extension running on port `5433` -> `5432` internally inside Docker.
- **MinIO Object Storage**: Running on port `9000` (API) and `9001` (Console) inside Docker.
- **Inngest Server**: Running on port `8288` (UI/Dev Server) inside Docker.

---

## 2. Active Checklist

- [x] Restore full CRM database schema (`schema.prisma` successfully loaded).
- [x] Push schema changes to Postgres (`pnpm prisma db push --accept-data-loss`).
- [x] Seed initial tables, lookup fields, and default system currencies.
- [x] Fix `TypeError: Cannot read properties of undefined (reading 'findMany')` crash by regenerating client and restarting the dev server.
- [x] Verify routing, database accessibility, and session handling guards.
- [x] Verify unauthenticated redirect to `/sign-in` works cleanly.
- [x] Overhaul global styling (`globals.css`) with transparent grid patterns and radial glowing layers.
- [x] Completely revamp marketing landing page (`(public)/page.tsx`) with real-time interactive CRM previewer sandbox and bento grid features.
- [x] Redesign onboarding signup flow (`(auth)/sign-up/page.tsx`) with dynamic morphing card widths and glowing progress indicators.
- [x] Enhance workspace template blueprint cards (`TemplateSelector.tsx`) with module-feature spec grids.
- [x] Fix `bis_skin_checked` browser-extension-induced hydration mismatch by injecting a dynamic global `MutationObserver` cleaner in `RootLayout`.
- [x] Fix invalid Tailwind padding class name typo `py=1` to `py-1` in `Heading` component.
- [x] Fix React 19 inline script tag warning by refactoring layout cleaner to use Next.js `Script` with `beforeInteractive` strategy.
- [x] Fix `<ShieldAlert /> is using incorrect casing` and `unrecognized in this browser` errors in sidebar panel by passing the imported Lucide icon component rather than a string.
- [x] Fix "changing uncontrolled input to be controlled" React warning in `InviteForm` by explicitly defining `defaultValues` during `useForm` initialization.
- [x] Wrap useSearchParams in Suspense boundary inside sign-up page (`app/[locale]/(auth)/sign-up/page.tsx`) to isolate hydration de-optimization in Next.js 16/React 19.
- [x] Dynamically set `dir` to `rtl`/`ltr` and import Noto Sans Arabic font fallback in root layout.
- [x] Add custom RTL typography override rule in `globals.css` for lang="ar".
- [x] Correct relations and back-relations in `prisma/schema.prisma` for `PurchaseOrders`, `InventoryStock`, `InventoryMovement`, `ReorderThreshold` to resolve DMMF client validation errors.
- [x] Seed GCC currencies (AED, SAR, QAR, KWD, BHD, OMR) and reciprocal exchange rates.
- [x] Register Arabic locale `"ar"` in next-intl routing and create high-fidelity locales dictionary `ar.json`.
- [x] Register Arabic option in `SetLanguage` selector UI component.
- [x] Append bilingually integrated sector templates in `definitions/index.ts` with custom filters in `TemplateSelector.tsx`.
- [x] Construct WhatsApp REST API routes proxy layer and serverless client container integrations with S3-persistence webhook mapping.
- [x] Fix "This Convex deployment does not have HTTP actions enabled" crash by creating the missing `convex/http.ts` router and syncing the routes to the local Convex backend.
- [x] Fix missing `toast` import from `sonner` in `sign-up/page.tsx` to prevent runtime crash during onboarding submission.
- [x] Fix JSX compilation error in `superadmin/settings/page.tsx` by adding the missing `</Card>` closing tag inside the AI settings tab.
- [x] Fix TypeScript type check errors in `FeedbackManager.tsx` by importing missing `Label` component and casting ticket priority and status lookups to matching keyof types.
- [x] Fix missing Convex Provider runtime crash in `TemplatesManager.tsx` and whatsapp pages by creating `ConvexClientProvider.tsx` and wrapping the entire app tree inside the root layout.
- [x] Fix Sidebar layout and pathname hydration mismatch error by invalidating Turbopack client-side cache and restarting the Next.js development server fresh.
- [x] Fix `TypeError: Cannot destructure property 'isLoading' of 'useAuth(...)' as it is undefined` in `ConvexClientProvider` by importing the correct `ConvexAuthProvider` from `@convex-dev/auth/react` (rather than the nextjs provider package).
- [x] Fix React 19 inline script hydration console warning inside `ThemeProvider.tsx` by introducing a client-side dynamic mounting guard.
- [x] Revert emails route (`app/[locale]/(routes)/emails/components/mail.tsx`) back to the standard CRM inbox layout.
- [x] Build an elegant, WhatsApp-inspired empty state setup card in `MailDisplay` to guide users to connect mailboxes when no accounts are active.
- [x] Overhaul "Add Email Account" Dialog in `EmailAccountsList.tsx` under Profile Settings with structured sections (General, IMAP, SMTP, folders) and live test alerts matching the premium theme.
- [x] Shift "Inventory" and "Purchases" out of the sales collapsible submenu (`Crm.tsx`) and promote them directly onto the main navigation sidebar (`app-sidebar.tsx`) when active.
- [x] Implement Convex templates dynamic seeding mutation (`convex/templates.ts`) and integrated client seeder hook on superadmin templates mount (`TemplatesManager.tsx`), mapping all category Lucide icons.
- [x] Add getSubscriptions query and deleteSubscription mutation to Convex backend.
- [x] Build client-side SuperAdminUserNav interactive dropdown menu.
- [x] Integrate premium App Switcher button and SuperAdminUserNav in the Super Admin layout header.
- [x] Create SubscriptionActions for manual provisioning (plan, status, cost, currency, expiry).
- [x] Overhaul placeholder subscriptions page to load executive dashboard and real-time ledgers table.
- [x] Inject Superadmin Resolution Portal note display inside resolved support/feedback tickets.


---

## 3. Backing Services Credentials

### Database (Postgres)
- **Host**: `127.0.0.1`
- **Port**: `5433`
- **User**: `flowlinepro`
- **Password**: `changeme`
- **DB**: `flowlinepro`

---

## 4. How to Log In Locally

Because Flowline Pro uses passwordless Email OTP for login, you have two options to log in locally:

### Option A: Self-Registration & Database Approval (Recommended)
1. Go to [http://localhost:3000/sign-in](http://localhost:3000/sign-in) and register a new user using your email (e.g., `deepakt369b@gmail.com`).
2. You will hit the "pending approval" screen.
3. Open a terminal and run the following command to approve your account directly in the PostgreSQL container:
   ```bash
   docker compose exec postgres psql -U flowlinepro -d flowlinepro -c "UPDATE \"Users\" SET \"userStatus\" = 'ACTIVE', \"role\" = 'admin' WHERE email = 'deepakt369b@gmail.com';"
   ```
4. Refresh your browser, and you will be fully logged in as an active Administrator!

### Option B: Log In as the Seeded Admin Account
1. Go to [http://localhost:3000/sign-in](http://localhost:3000/sign-in) and enter the seeded admin email: `admin@example.com`.
2. When prompted for the OTP code, open your terminal and query the verification table directly from PostgreSQL to extract the newly generated code:
   ```bash
   docker compose exec postgres psql -U flowlinepro -d flowlinepro -c "SELECT identifier, value, \"expiresAt\" FROM \"Verification\" ORDER BY \"createdAt\" DESC LIMIT 1;"
   ```
3. Copy the numeric code under the `value` column and enter it on the sign-in page to log in as the default Admin!
