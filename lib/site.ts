/**
 * Deployment-specific values (public URL, contact address, email switch).
 * Everything that used to be hardcoded to byunsaid.com reads from here.
 */

const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const APP_URL = (
    process.env.NEXT_PUBLIC_APP_URL ??
    (vercelProductionUrl
        ? `https://${vercelProductionUrl}`
        : "http://localhost:3000")
).replace(/\/$/, "");

export const CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gabspereira178@gmail.com";

/** Outbound email is off unless explicitly enabled (needs a verified sending domain). */
export const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";

export const EMAIL_FROM =
    process.env.EMAIL_FROM ?? "Unsaid <onboarding@resend.dev>";
