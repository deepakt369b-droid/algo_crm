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
// The pattern list mirrors the `functions` config in
// `open-next.config.ts`. Keep them in sync.

import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const WORKER_PATH = path.join(".open-next", "worker.js");
const DEFAULT_HANDLER = path.join(".open-next", "server-functions", "default", "handler.mjs");

// Each entry: a URL prefix served by the split function.
// The default function handles every other path.
const DISPATCH = [
  { prefix: "/api/invoices/", fn: "pdf", match: (p) => /^\/api\/invoices\/[^/]+\/pdf\/?$/.test(p) },
  { prefix: "/api/mcp", fn: "mcp" },
  { prefix: "/api/inngest", fn: "inngest" },
  { prefix: "/api/upload/presigned-url", fn: "upload" },
];

const TEMPLATE = `//@ts-expect-error: Will be resolved by wrangler build
import { handleCdnCgiImageRequest, handleImageRequest } from "./cloudflare/images.js";
//@ts-expect-error: Will be resolved by wrangler build
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

const dispatch = [
${DISPATCH.map(
  (d) =>
    `  { fn: ${JSON.stringify(d.fn)}, prefix: ${JSON.stringify(d.prefix)}, match: ${d.match ? d.match.toString() : "null"} },`,
).join("\n")}
];

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            const response = maybeGetSkewProtectionResponse(request);
            if (response) {
                return response;
            }
            const url = new URL(request.url);
            if (url.pathname.startsWith("/cdn-cgi/image/")) {
                return handleCdnCgiImageRequest(url, env);
            }
            if (url.pathname ===
                \`\${globalThis.__NEXT_BASE_PATH__}/_next/image\${globalThis.__TRAILING_SLASH__ ? "/" : ""}\`) {
                return await handleImageRequest(url, request.headers, env);
            }
            const reqOrResp = await middlewareHandler(request, env, ctx);
            if (reqOrResp instanceof Response) {
                return reqOrResp;
            }
            // Dispatch to a split server-function by URL pattern. The
            // split function's index.mjs is small (no full bundling),
            // so each file stays under the Cloudflare 25 MiB limit.
            for (const d of dispatch) {
                if (url.pathname === d.prefix || url.pathname.startsWith(d.prefix) || (d.match && d.match(url.pathname))) {
                    // @ts-expect-error: resolved by wrangler build
                    const { handler } = await import(\`./server-functions/\${d.fn}/index.mjs\`);
                    return handler(reqOrResp, env, ctx, request.signal);
                }
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
console.log(`[patch-worker] wrote dispatcher worker to ${WORKER_PATH}`);

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
