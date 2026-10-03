import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project is a standalone repository even inside a shared checkout folder.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  reactStrictMode: true,
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    // Next's static hydration/structured-data scripts and existing inline
    // styles need unsafe-inline. This is a resource boundary, not a strict
    // nonce policy or a substitute for escaping/sanitizing content.
    const policy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
    ].join("; ");
    const shared = [
      { key: "Content-Security-Policy", value: policy },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    // Keep the secret admin surface out of search engines even if a URL leaks, out of other sites'
    // frames (no clickjacking of the login or the adjust buttons), and out of every cache.
    const admin = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/:path*", headers: shared },
      { source: "/controller", headers: admin },
      { source: "/api/controller/:path*", headers: admin },
    ];
  },
};

export default nextConfig;
