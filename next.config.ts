import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
        protocol: "https",
        hostname: "vmhlernvxnixomfvpbsp.supabase.co",
        pathname: "/storage/v1/object/public/**",
    },
];

// Allow local Supabase storage in development only — 127.0.0.1 is blocked in prod
if (process.env.NODE_ENV === "development") {
    remotePatterns.push({
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/**",
    });
}

const nextConfig: NextConfig = {
    images: {
        remotePatterns,
    },
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "@hugeicons/react",
            "@hugeicons/core-free-icons",
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                    { key: "X-XSS-Protection", value: "0" },
                    // CSP: full policy is a post-launch item
                ],
            },
        ];
    },
};

// Skip Sentry webpack plugin when auth token is not available (e.g. local dev)
const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

export default sentryEnabled
    ? withSentryConfig(nextConfig, {
          org: "unsaid-m2",
          project: "javascript-nextjs",
          silent: !process.env.CI,
          widenClientFileUpload: true,
          tunnelRoute: "/monitoring",
          webpack: {
              automaticVercelMonitors: true,
              treeshake: {
                  removeDebugLogging: true,
              },
          },
      })
    : nextConfig;
