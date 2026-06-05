import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  buildCommand: "node node_modules/next/dist/bin/next build",
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: [
    "node:crypto",
    "@better-auth/core/instrumentation",
  ],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  functions: {
    pdf: {
      routes: ["app/api/invoices/[invoiceId]/pdf/route"],
      patterns: ["/api/invoices/*/pdf"],
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: "dummy",
        tagCache: "dummy",
        queue: "dummy",
      },
    },
    mcp: {
      routes: ["app/api/mcp/[transport]/route"],
      patterns: ["/api/mcp/*"],
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: "dummy",
        tagCache: "dummy",
        queue: "dummy",
      },
    },
    inngest: {
      routes: ["app/api/inngest/route"],
      patterns: ["/api/inngest", "/api/inngest/*"],
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: "dummy",
        tagCache: "dummy",
        queue: "dummy",
      },
    },
    upload: {
      routes: ["app/api/upload/presigned-url/route"],
      patterns: ["/api/upload/presigned-url"],
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: "dummy",
        tagCache: "dummy",
        queue: "dummy",
      },
    },
  },
};

export default config;
