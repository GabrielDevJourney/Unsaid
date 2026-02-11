// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://5450c40a4ae2cbd8e5060c5e5c45e595@o4510653319282688.ingest.de.sentry.io/4510653320659024",

    // Disable Sentry in development to preserve the 5k/month error quota
    enabled: process.env.NODE_ENV !== "development",

    integrations: [Sentry.replayIntegration()],

    tracesSampleRate: 1,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
