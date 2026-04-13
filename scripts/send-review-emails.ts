/**
 * Send all email templates to a single inbox for review.
 *
 * Usage:
 *   npx tsx scripts/send-review-emails.ts <email>
 *   npx tsx scripts/send-review-emails.ts <email> --only=weekly,waitlist
 */

import { config } from "dotenv";

config({ path: ".env.local" });

type TemplateKey =
    | "writing"
    | "weekly"
    | "trial"
    | "progress"
    | "waitlist";

const ALL_TEMPLATES: TemplateKey[] = [
    "writing",
    "weekly",
    "trial",
    "progress",
    "waitlist",
];

function parseArgs() {
    const args = process.argv.slice(2);
    const email = args.find(
        (arg) => !arg.startsWith("--") && arg.includes("@"),
    );
    const onlyArg = args.find((arg) => arg.startsWith("--only="));

    if (!email) {
        console.error(
            "Usage: npx tsx scripts/send-review-emails.ts <email> [--only=writing,weekly,trial,progress,waitlist]",
        );
        process.exit(1);
    }

    const selected = onlyArg
        ? onlyArg
              .replace("--only=", "")
              .split(",")
              .map((item) => item.trim())
              .filter((item): item is TemplateKey =>
                  ALL_TEMPLATES.includes(item as TemplateKey),
              )
        : ALL_TEMPLATES;

    return { email, selected };
}

function nameFromEmail(email: string) {
    return email.split("@")[0] ?? "there";
}

async function sendWriting(email: string) {
    const { sendWritingReminderEmail } = await import("../lib/email/service");

    return sendWritingReminderEmail(email, nameFromEmail(email), null);
}

async function sendWeekly(email: string) {
    const { sendWeeklyPatternsEmail } = await import("../lib/email/service");

    return sendWeeklyPatternsEmail(email, nameFromEmail(email), {
        patternCount: 3,
        entryCount: 15,
        insightsCount: 19,
        patterns: [
            {
                title: "Progress Blindness",
                patternType: "behavioral_pattern",
            },
            {
                title: "Boundary Avoidance",
                patternType: "growth",
            },
            {
                title: "Sunday Anticipation Spiral",
                patternType: "emotional_trigger",
            },
        ],
    });
}

async function sendTrial(email: string) {
    const { sendTrialEndingEmail } = await import("../lib/email/service");

    return sendTrialEndingEmail(email, nameFromEmail(email), 3, {
        entriesWritten: 15,
        patternsFound: 3,
        insightsReceived: 19,
    });
}

async function sendProgress(email: string) {
    const { sendProgressCheckEmail } = await import("../lib/email/service");

    return sendProgressCheckEmail(
        email,
        nameFromEmail(email),
        "You understand yourself clearly and use that clarity to avoid actually moving.",
        {
            entryCount: 15,
            patternsFound: 3,
            insightsGiven: 19,
            nextMilestone: 30,
            progressLabel: "15/30",
            fillPct: 50,
        },
    );
}

async function sendWaitlist(email: string) {
    const { sendWaitlistConfirmationEmail } = await import(
        "../lib/email/service"
    );

    return sendWaitlistConfirmationEmail(email, 247);
}

const SENDERS: Record<
    TemplateKey,
    (email: string) => Promise<{ success: boolean; error?: string }>
> = {
    writing: sendWriting,
    weekly: sendWeekly,
    trial: sendTrial,
    progress: sendProgress,
    waitlist: sendWaitlist,
};

async function main() {
    const { email, selected } = parseArgs();

    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY in environment");
        process.exit(1);
    }

    console.log("\n========================================");
    console.log("         Send Review Emails");
    console.log("========================================");
    console.log(`Inbox: ${email}`);
    console.log(`Templates: ${selected.join(", ")}`);

    for (const template of selected) {
        console.log(`\nSending ${template}...`);
        const result = await SENDERS[template](email);

        if (result.success) {
            console.log(`✓ ${template} sent`);
        } else {
            console.error(`✗ ${template} failed: ${result.error}`);
        }
    }

    console.log("\nDone. Check Resend and your inbox.");
}

main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
