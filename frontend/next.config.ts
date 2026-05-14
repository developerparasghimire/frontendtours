import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || BACKEND_URL;
const isProduction = process.env.NODE_ENV === "production";
const ONE_DAY = 60 * 60 * 24;
const ONE_YEAR = ONE_DAY * 365;
const NO_STORE_CACHE_CONTROL = "no-store, no-cache, must-revalidate";

// Derive an origin (scheme://host[:port]) from a URL string for CSP connect-src.
function originOf(value: string): string {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

const apiOrigin = originOf(PUBLIC_API_URL);
const backendOrigin = originOf(BACKEND_URL);

// In dev, Django serves at both 127.0.0.1 and localhost. Whichever the env
// uses, allow the other in CSP too so images/API calls don't get blocked.
const devLoopbackOrigins = !isProduction
  ? ["http://127.0.0.1:8000", "http://localhost:8000"]
  : [];
const allLoopbackOrigins = Array.from(
  new Set([apiOrigin, backendOrigin, ...devLoopbackOrigins].filter(Boolean))
).join(" ");

// Content-Security-Policy:
// - Google Sign-In requires accounts.google.com (script + frame + connect).
// - Cloudinary serves images. Backend serves images + API.
// - 'unsafe-inline' on script-src is unfortunate but Next.js inlines runtime/JSON-LD;
//   removing it would require nonce-based CSP which Next App Router does not yet
//   wire up automatically. Inline styles are required by Tailwind/Next.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com ${allLoopbackOrigins}`.trim(),
  `connect-src 'self' https://accounts.google.com ${allLoopbackOrigins}`.trim(),
  "frame-src 'self' https://accounts.google.com https://www.google.com https://maps.google.com https://maps.googleapis.com",
  "worker-src 'self' blob:",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
]
  .filter(Boolean)
  .join("; ");

// Extract hostname from BACKEND_URL for image remote patterns
let backendHostname = "localhost";
let backendPort: string | undefined = "8000";
let backendProtocol: "http" | "https" = "http";
try {
  const parsed = new URL(BACKEND_URL);
  backendHostname = parsed.hostname;
  backendPort = parsed.port || undefined;
  backendProtocol = parsed.protocol.replace(":", "") as "http" | "https";
} catch {}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 68, 70, 72, 75, 76],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // H12: cache optimized images for 1 year. Source URLs change when content
    // is updated (Cloudinary versioning, Django timestamped media), so a long
    // TTL is safe and cuts re-optimization cost.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    // Local Django uploads resolve to 127.0.0.1 in development.
    dangerouslyAllowLocalIP: !isProduction,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: backendProtocol,
        hostname: backendHostname,
        ...(backendPort ? { port: backendPort } : {}),
      },
      // Django's request.build_absolute_uri often returns 127.0.0.1 even
      // when BACKEND_URL is configured as "localhost" (or vice-versa).
      // Allow both loopback hosts in development to avoid broken images.
      ...(!isProduction
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "8000",
            },
            {
              protocol: "http" as const,
              hostname: "localhost",
              port: "8000",
            },
          ]
        : []),
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // same-origin-allow-popups is required for Google One-Tap / GSI to work.
          // "same-origin" breaks the gsi/transform iframe that Google Identity Services uses.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          ...(isProduction
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
            : []),
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: NO_STORE_CACHE_CONTROL },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/service-worker.js",
        headers: [
          { key: "Cache-Control", value: NO_STORE_CACHE_CONTROL },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/logo.png",
        headers: [
          { key: "Cache-Control", value: NO_STORE_CACHE_CONTROL },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/img/:path*",
        headers: [
          { key: "Cache-Control", value: NO_STORE_CACHE_CONTROL },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect legacy logo.jpeg / logo.jpg requests to the canonical logo.png.
      // Some browser caches, crawlers, and old siteConfig DB entries request these.
      {
        source: "/logo.jpeg",
        destination: "/logo.png",
        permanent: true,
      },
      {
        source: "/logo.jpg",
        destination: "/logo.png",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
