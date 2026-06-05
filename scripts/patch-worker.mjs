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
//   2. The default fallback is changed to import
//      `./server-functions/default/index.mjs` (the unbundled entry that
//      resolves to its own `node_modules/`). This keeps `handler.mjs`
//      from being needed at all, so Cloudflare Pages never has to upload
//      a >25 MiB file.
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

import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const WORKER_PATH = path.join(".open-next", "worker.js");
const PAGES_WORKER_PATH = path.join(".open-next", "_worker.js");
const DEFAULT_HANDLER = path.join(".open-next", "server-functions", "default", "handler.mjs");

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
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
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
            // Dispatch to a split server-function by URL pattern. The
            // split function's index.mjs is small (no full bundling),
            // so each file stays under the Cloudflare 25 MiB limit.
            // Each import below uses a STATIC string literal so
            // esbuild creates a separate code-split chunk for it.
            // Dynamic imports with non-static paths are not analyzed
            // by the bundler and fail at runtime in the Workers
            // runtime (no filesystem).
            if (/^\\/api\\/invoices\\/[^/]+\\/pdf\\/?$/.test(url.pathname)) {
                // @ts-expect-error: resolved by wrangler build
                const { handler } = await import("./server-functions/pdf/index.mjs");
                return handler(reqOrResp, env, ctx, request.signal);
            }
            if (url.pathname.startsWith("/api/mcp")) {
                // @ts-expect-error: resolved by wrangler build
                const { handler } = await import("./server-functions/mcp/index.mjs");
                return handler(reqOrResp, env, ctx, request.signal);
            }
            if (url.pathname.startsWith("/api/inngest")) {
                // @ts-expect-error: resolved by wrangler build
                const { handler } = await import("./server-functions/inngest/index.mjs");
                return handler(reqOrResp, env, ctx, request.signal);
            }
            if (url.pathname === "/api/upload/presigned-url" || url.pathname.startsWith("/api/upload/presigned-url/")) {
                // @ts-expect-error: resolved by wrangler build
                const { handler } = await import("./server-functions/upload/index.mjs");
                return handler(reqOrResp, env, ctx, request.signal);
            }
            // Fallback: use the default function's unbundled entry point.
            // This avoids the fully-bundled handler.mjs (35 MiB on this
            // project) which would exceed Cloudflare's 25 MiB per-file
            // limit. index.mjs is small and resolves to its own
            // node_modules/ at runtime.
            // @ts-expect-error: resolved by wrangler build
            const { handler } = await import("./server-functions/default/index.mjs");
            return handler(reqOrResp, env, ctx, request.signal);
        });
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

try {
  await unlink(DEFAULT_HANDLER);
  console.log(`[patch-worker] removed oversized bundled handler at ${DEFAULT_HANDLER}`);
} catch (err) {
  if (err && err.code === "ENOENT") {
    console.log(`[patch-worker] no bundled handler at ${DEFAULT_HANDLER} (already absent)`);
  } else {
    throw err;
  }
}
