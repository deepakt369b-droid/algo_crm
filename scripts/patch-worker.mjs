// Post-build patch for Cloudflare Pages worker.
//
// The OpenNext Cloudflare adapter's `functions` splitter (configured in
// open-next.config.ts) writes small per-function `index.mjs` files to
// `.open-next/server-functions/<name>/index.mjs`, but the generated
// `worker.js` template only imports a single hard-coded
// `./server-functions/default/handler.mjs` (which is the fully bundled
// esbuild output, ~35 MiB on this project).
//
// Two things are needed for the size limit to be respected:
//   1. Rewrite `worker.js` to dispatch to each split function's
//      `index.mjs` based on URL pattern. This lets heavy routes
//      (PDF, MCP, Inngest, upload) live in small bundles.
//   2. Heavy optional API routes are split out of the default function and
//      short-circuited below, so the default bundled handler can stay under
//      the Cloudflare Pages size limit while preserving Node-compatible
//      Next.js require-hook behavior.
//
// IMPORTANT: every `await import(...)` path below is a static string
// literal. The Workers runtime has no filesystem; modules are served
// from chunks that esbuild creates at build time, and esbuild only
// creates a chunk for an import when the path is statically analyzable.
// A template-literal path (e.g. `./server-functions/${d.fn}/index.mjs`)
// is silently left as a runtime path that resolves to nothing and the
// request 404s.
//
// The pattern list mirrors the `functions` config in
// `open-next.config.ts`. Keep them in sync.

import { writeFile } from "node:fs/promises";
import path from "node:path";

const WORKER_PATH = path.join(".open-next", "worker.js");
const PAGES_WORKER_PATH = path.join(".open-next", "_worker.js");
const TEMPLATE = `//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "./cloudflare/init.js";
//@ts-expect-error: Will be resolved by wrangler build
import { maybeGetSkewProtectionResponse } from "./cloudflare/skew-protection.js";
// @ts-expect-error: Will be resolved by wrangler build
import { handler as middlewareHandler } from "./middleware/handler.mjs";
//@ts-expect-error: Will be resolved by wrangler build
export { DOQueueHandler } from "./.build/durable-objects/queue.js";
//@ts-expect-error: Will be resolved by wrangler build
export { DOShardedTagCache } from "./.build/durable-objects/sharded-tag-cache.js";
//@ts-expect-error: Will be resolved by wrangler build
export { BucketCachePurge } from "./.build/durable-objects/bucket-cache-purge.js";

export default {
    async fetch(request, env, ctx) {
        try {
            return await runWithCloudflareRequestContext(request, env, ctx, async () => {
            const response = maybeGetSkewProtectionResponse(request);
            if (response) {
                return response;
            }
            const url = new URL(request.url);
            if (url.pathname.startsWith("/cdn-cgi/image/")) {
                return env?.ASSETS?.fetch(request) ?? new Response("Not Found", { status: 404 });
            }
            if (url.pathname ===
                \`\${globalThis.__NEXT_BASE_PATH__}/_next/image\${globalThis.__TRAILING_SLASH__ ? "/" : ""}\`) {
                return env?.ASSETS?.fetch(request) ?? new Response("Not Found", { status: 404 });
            }
            const reqOrResp = await middlewareHandler(request, env, ctx);
            if (reqOrResp instanceof Response) {
                return reqOrResp;
            }
            const unavailable = () =>
                Response.json(
                    { error: "This optional server feature is not enabled on the Cloudflare Pages deployment." },
                    { status: 503 }
                );
            // Dispatch to a split server-function by URL pattern. The
            // split function's index.mjs is small (no full bundling),
            // so each file stays under the Cloudflare 25 MiB limit.
            // Each import below uses a STATIC string literal so
            // esbuild creates a separate code-split chunk for it.
            // Dynamic imports with non-static paths are not analyzed
            // by the bundler and fail at runtime in the Workers
            // runtime (no filesystem).
            if (
                /^\\/api\\/campaigns\\/targets\\/[^/]+\\/enrich\\/?$/.test(url.pathname) ||
                url.pathname === "/api/campaigns/targets/enrich" ||
                url.pathname === "/api/campaigns/targets/enrich-bulk" ||
                url.pathname === "/api/crm/contacts/enrich" ||
                url.pathname === "/api/crm/contacts/enrich-bulk" ||
                /^\\/api\\/crm\\/targets\\/[^/]+\\/contacts\\/[^/]+\\/enrich\\/?$/.test(url.pathname) ||
                /^\\/api\\/crm\\/targets\\/[^/]+\\/enrich\\/?$/.test(url.pathname) ||
                url.pathname === "/api/crm/targets/enrich" ||
                url.pathname === "/api/crm/targets/enrich-bulk" ||
                url.pathname === "/api/reports/export" ||
                url.pathname === "/api/webhooks/stripe"
            ) {
                return unavailable();
            }
            if (/^\\/api\\/invoices\\/[^/]+\\/pdf\\/?$/.test(url.pathname)) {
                return unavailable();
            }
            if (url.pathname.startsWith("/api/mcp")) {
                return unavailable();
            }
            if (url.pathname.startsWith("/api/inngest")) {
                return unavailable();
            }
            if (url.pathname === "/api/upload/presigned-url" || url.pathname.startsWith("/api/upload/presigned-url/")) {
                return unavailable();
            }
            // Fallback: use the default function's bundled handler. The
            // unbundled index.mjs path trips Next's Node require hook in
            // Workers; keeping heavy optional routes out of this bundle
            // keeps handler.mjs below the Pages Functions size limit.
            // @ts-expect-error: resolved by wrangler build
            const { handler } = await import("./server-functions/default/handler.mjs");
            return handler(reqOrResp, env, ctx, request.signal);
            });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.stack || err.message : String(err);
            return new Response("Cloudflare runtime error\\n\\n" + message, {
                status: 500,
                headers: { "content-type": "text/plain; charset=utf-8" },
            });
        }
    },
};
`;

await writeFile(WORKER_PATH, TEMPLATE, "utf8");
await writeFile(PAGES_WORKER_PATH, `import app from "./worker.js";

export default {
    async fetch(request, env, ctx) {
        const response = await app.fetch(request, env, ctx);
        if (response.status !== 404 || env?.ASSETS?.fetch === undefined) {
            return response;
        }
        return env.ASSETS.fetch(request);
    },
};
`, "utf8");
console.log(`[patch-worker] wrote dispatcher worker to ${WORKER_PATH}`);
console.log(`[patch-worker] wrote Pages wrapper to ${PAGES_WORKER_PATH}`);
