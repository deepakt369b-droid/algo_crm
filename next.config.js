const withNextIntl = require("next-intl/plugin")(
  "./i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "pg-cloudflare",
    "pg",
    "@react-pdf/renderer",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "@aws-sdk/signature-v4-crt",
    "mammoth",
    "mongodb",
    "imap",
    "mailparser",
    "nodemailer",
    "bcrypt",
    "bcryptjs",
    "better-auth",
    // @better-auth/core must be externalized so OpenNext's `copyWorkerdPackages`
    // copies it into `.open-next` and esbuild (with `conditions: ["workerd"]`)
    // can resolve `@better-auth/core/instrumentation` (which has a `workerd`
    // export pointing to `./dist/instrumentation/pure.index.mjs`).
    "@better-auth/core",
    "canvas",
    "sharp",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "minio-cwg0o4ss0scoccgwso8sk004.coolify.cz" },
      { protocol: "http", hostname: "minio" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:locale/crm/targets/:path*",
        destination: "/:locale/campaigns/targets/:path*",
        permanent: true,
      },
      {
        source: "/:locale/crm/target-lists/:path*",
        destination: "/:locale/campaigns/target-lists/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

