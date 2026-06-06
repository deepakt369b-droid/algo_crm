# SaaS Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve onboarding template selection, landing page polish, dashboard AI placement, loading speed, and WhatsApp CRM integration reliability.

**Architecture:** Keep changes inside the existing Next.js App Router, shadcn component set, Supabase-backed server actions, and current WhatsApp proxy API. Avoid new heavy client dependencies; use CSS transitions and server-side parallel data fetching.

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui, Tailwind, Supabase, openWA-compatible WhatsApp HTTP API.

---

### Task 1: Onboarding Template Picker

**Files:**
- Modify: `app/[locale]/(auth)/sign-up/page.tsx`
- Modify: `components/onboarding/TemplateSelector.tsx`

- [ ] Widen the step-2 signup shell from `max-w-5xl` to a wider responsive container.
- [ ] Replace the narrow vertical template list with a responsive two/three-column grid.
- [ ] Keep the selected-template summary visible on large screens and compact on smaller screens.
- [ ] Verify the layout no longer shows only one visible template on desktop.

### Task 2: Landing Page Motion

**Files:**
- Modify: `app/[locale]/(public)/page.tsx`
- Modify: `app/[locale]/globals.css`

- [ ] Add lightweight motion classes using CSS only.
- [ ] Apply motion and richer visual hierarchy to existing landing page sections without adding a new dependency.
- [ ] Keep content readable and avoid slowing initial load.

### Task 3: AI Dashboard Placement And Speed

**Files:**
- Modify: `app/[locale]/(routes)/crm/dashboard/page.tsx`
- Modify: `app/[locale]/(routes)/dashboard/page.tsx`

- [ ] Remove `AIInsightCard` from the CRM Kanban dashboard.
- [ ] Add `AIInsightCard` to the main dashboard.
- [ ] Parallelize dashboard data fetching with `Promise.all`.
- [ ] Keep existing dashboard cards and translations intact.

### Task 4: WhatsApp Integration Runtime Fixes

**Files:**
- Modify: `app/[locale]/(routes)/admin/whatsapp/page.tsx`
- Modify: `app/[locale]/(routes)/admin/whatsapp/WhatsAppInstanceCard.tsx`
- Modify: `app/api/whatsapp/send/route.ts`
- Modify: `lib/whatsapp/client.ts`

- [ ] Remove the hardcoded demo tenant ID and let server actions resolve tenant from session.
- [ ] Use `instance.id` for QR requests instead of the nonexistent `instance._id`.
- [ ] Import `supabaseAdmin` in the WhatsApp send route.
- [ ] Support common openWA Easy API response and endpoint shapes for QR and send.
- [ ] Add actionable errors for missing `WHATSAPP_API_URL` or `WHATSAPP_API_KEY`.

### Task 5: Verification

**Files:**
- Verify changed files and build output.

- [ ] Run `node_modules\.bin\next.CMD build`.
- [ ] Run `git diff --check`.
- [ ] Review `git diff --stat`.
- [ ] Push after successful verification.
