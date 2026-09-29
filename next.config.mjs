import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project is a standalone repository even inside a shared checkout folder.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  reactStrictMode: true,
  async headers() {
    // Keep the secret admin surface out of search engines even if a URL leaks, out of other sites'
    // frames (no clickjacking of the login or the adjust buttons), and out of every cache.
    const admin = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/controller", headers: admin },
      { source: "/api/controller/:path*", headers: admin },
    ];
  },
};

export default nextConfig;
