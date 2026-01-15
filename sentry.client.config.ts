// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://5450c40a4ae2cbd8e5060c5e5c45e595@o4510653319282688.ingest.de.sentry.io/4510653320659024",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Enable session replay to capture user interactions leading up to errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            // Mask all text content and block all media for privacy
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
