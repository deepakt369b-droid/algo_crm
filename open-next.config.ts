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
    disabledHeavy: {
      routes: [
        "app/api/campaigns/targets/[id]/enrich/route",
        "app/api/campaigns/targets/enrich/route",
        "app/api/campaigns/targets/enrich-bulk/route",
        "app/api/crm/contacts/enrich/route",
        "app/api/crm/contacts/enrich-bulk/route",
        "app/api/crm/targets/[id]/contacts/[contactId]/enrich/route",
        "app/api/crm/targets/[id]/enrich/route",
        "app/api/crm/targets/enrich/route",
        "app/api/crm/targets/enrich-bulk/route",
        "app/api/reports/export/route",
        "app/api/webhooks/stripe/route",
      ],
      patterns: [
        "/api/campaigns/targets/*/enrich",
        "/api/campaigns/targets/enrich",
        "/api/campaigns/targets/enrich-bulk",
        "/api/crm/contacts/enrich",
        "/api/crm/contacts/enrich-bulk",
        "/api/crm/targets/*/contacts/*/enrich",
        "/api/crm/targets/*/enrich",
        "/api/crm/targets/enrich",
        "/api/crm/targets/enrich-bulk",
        "/api/reports/export",
        "/api/webhooks/stripe",
      ],
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: "dummy",
        tagCache: "dummy",
        queue: "dummy",
      },
    },
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
