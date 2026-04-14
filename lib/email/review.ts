import type { PatternTypeCode } from "@/lib/constants/pattern-types";
import {
    sendProgressCheckEmail,
    sendTrialEndingEmail,
    sendWaitlistConfirmationEmail,
    sendWeeklyPatternsEmail,
    sendWritingReminderEmail,
} from "@/lib/email/service";

export type ReviewTemplateKey =
    | "all"
    | "writing"
    | "weekly"
    | "trial"
    | "progress"
    | "waitlist";

export type ReviewPresetKey =
    | "default"
    | "writing-never"
    | "writing-5-days"
    | "weekly-one"
    | "weekly-three"
    | "trial-3-days"
    | "trial-1-day"
    | "progress-15"
    | "progress-60"
    | "waitlist-early"
    | "waitlist-later";

export const REVIEW_TEMPLATE_OPTIONS: Array<{
    key: ReviewTemplateKey;
    label: string;
}> = [
    { key: "all", label: "All templates" },
    { key: "writing", label: "Writing reminder" },
    { key: "weekly", label: "Weekly patterns" },
    { key: "trial", label: "Trial ending" },
    { key: "progress", label: "Progress check" },
    { key: "waitlist", label: "Waitlist confirmation" },
];

export const REVIEW_PRESET_OPTIONS: Array<{
    key: ReviewPresetKey;
    label: string;
}> = [
    { key: "default", label: "Default" },
    { key: "writing-never", label: "Writing — never written" },
    { key: "writing-5-days", label: "Writing — 5 days inactive" },
    { key: "weekly-one", label: "Weekly — 1 pattern" },
    { key: "weekly-three", label: "Weekly — 3 patterns" },
    { key: "trial-3-days", label: "Trial — 3 days left" },
    { key: "trial-1-day", label: "Trial — 1 day left" },
    { key: "progress-15", label: "Progress — 15 entries" },
    { key: "progress-60", label: "Progress — 60 entries" },
    { key: "waitlist-early", label: "Waitlist — #19" },
    { key: "waitlist-later", label: "Waitlist — #247" },
];

export const DELIVERABILITY_CHECKLIST = [
    "Check inbox placement in Gmail: inbox, promotions, spam, or bin.",
    "Confirm all images load from byunsaid.com or emails.byunsaid.com.",
    "Confirm CTA links use the production domain instead of ngrok.",
    "Check Resend preview for layout drift and missing assets.",
    "Compare Gmail rendering against Resend preview for icon and font issues.",
];

function nameFromEmail(email: string) {
    return email.split("@")[0] ?? "there";
}

function weeklyPatterns(count: 1 | 3): Array<{
    title: string;
    patternType: PatternTypeCode;
}> {
    const patterns: Array<{ title: string; patternType: PatternTypeCode }> = [
        {
            title: "Sunday Anticipation Spiral",
            patternType: "emotional_trigger",
        },
        {
            title: "Progress Blindness",
            patternType: "behavioral_pattern",
        },
        {
            title: "Boundary Avoidance",
            patternType: "growth",
        },
    ];

    return patterns.slice(0, count);
}

export async function sendReviewEmail({
    to,
    template,
    preset = "default",
}: {
    to: string;
    template: Exclude<ReviewTemplateKey, "all">;
    preset?: ReviewPresetKey;
}): Promise<{ success: boolean; error?: string }> {
    const userName = nameFromEmail(to);

    switch (template) {
        case "writing":
            return sendWritingReminderEmail(
                to,
                userName,
                preset === "writing-5-days" ? 5 : null,
            );

        case "weekly": {
            const patternCount = preset === "weekly-one" ? 1 : 3;

            return sendWeeklyPatternsEmail(to, userName, {
                patternCount,
                entryCount: 15,
                insightsCount: 19,
                patterns: weeklyPatterns(patternCount as 1 | 3),
            });
        }

        case "trial": {
            const daysRemaining = preset === "trial-1-day" ? 1 : 3;

            return sendTrialEndingEmail(to, userName, daysRemaining, {
                entriesWritten: 15,
                patternsFound: 3,
                insightsReceived: 19,
            });
        }

        case "progress": {
            const isLarge = preset === "progress-60";

            return sendProgressCheckEmail(
                to,
                userName,
                isLarge
                    ? "You understand yourself clearly and use that clarity to stay exactly where you are."
                    : "You're developing greater self-awareness and starting to catch yourself mid-pattern.",
                {
                    entryCount: isLarge ? 60 : 15,
                    patternsFound: isLarge ? 18 : 3,
                    insightsGiven: isLarge ? 75 : 19,
                    nextMilestone: isLarge ? 75 : 30,
                    progressLabel: isLarge ? "60/75" : "15/30",
                    fillPct: 50,
                },
            );
        }

        case "waitlist":
            return sendWaitlistConfirmationEmail(
                to,
                preset === "waitlist-early" ? 19 : 247,
            );
    }
}

export async function sendAllReviewEmails(to: string) {
    const results = await Promise.all([
        sendReviewEmail({ to, template: "writing", preset: "writing-never" }),
        sendReviewEmail({ to, template: "weekly", preset: "weekly-three" }),
        sendReviewEmail({ to, template: "trial", preset: "trial-3-days" }),
        sendReviewEmail({ to, template: "progress", preset: "progress-15" }),
        sendReviewEmail({ to, template: "waitlist", preset: "waitlist-later" }),
    ]);

    return [
        { template: "writing", ...results[0] },
        { template: "weekly", ...results[1] },
        { template: "trial", ...results[2] },
        { template: "progress", ...results[3] },
        { template: "waitlist", ...results[4] },
    ];
}
