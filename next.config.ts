import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
