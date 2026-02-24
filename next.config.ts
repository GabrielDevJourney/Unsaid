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
