import type { ReactElement } from "react";
import { Resend } from "resend";
import type { PatternTypeCode } from "@/lib/constants/pattern-types";

const FROM_EMAIL = "Unsaid <hello@emails.byunsaid.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://byunsaid.com";
const NOTIFICATION_SETTINGS_URL = `${APP_URL}/settings#notifications`;

interface SendEmailParams {
    to: string;
    subject: string;
    react: ReactElement;
    templateName: string;
}

/**
 * Lazily initialized Resend instance.
 * Prevents build-time execution failures in CI / Next.js.
 */
let resendInstance: Resend | null = null;

function getResend(): Resend {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error("RESEND_API_KEY is not set");
        }

        resendInstance = new Resend(apiKey);
    }

    return resendInstance;
}

/**
 * Generic email sender wrapper.
 */
export const sendEmail = async ({
    to,
    subject,
    react,
    templateName,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> => {
    try {
        const resend = getResend();

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            react,
        });

        if (error) {
            console.error("Email send error:", {
                templateName,
                to,
                subject,
                error: error.message,
            });
            return { success: false, error: error.message };
        }

        console.info("Email sent:", {
            templateName,
            to,
            subject,
            messageId: data?.id ?? null,
        });

        return { success: true };
    } catch (err) {
        console.error("Email send failed:", {
            templateName,
            to,
            subject,
            error: err instanceof Error ? err.message : "Unknown error",
        });
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

/**
 * Send trial ending reminder email.
 */
export const sendTrialEndingEmail = async (
    to: string,
    userName: string,
    daysRemaining: number,
    stats: {
        entriesWritten: number;
        patternsFound: number;
        insightsReceived: number;
    },
): Promise<{ success: boolean; error?: string }> => {
    const { default: TrialEndingEmail } = await import("@/emails/trial-ending");

    return sendEmail({
        to,
        subject: `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
        templateName: "trial-ending",
        react: TrialEndingEmail({
            userName,
            daysRemaining,
            entriesWritten: stats.entriesWritten,
            patternsFound: stats.patternsFound,
            insightsReceived: stats.insightsReceived,
            upgradeUrl: `${APP_URL}/settings`,
            recipientEmail: to,
            unsubscribeUrl: NOTIFICATION_SETTINGS_URL,
        }),
    });
};

/**
 * Send weekly patterns ready email.
 */
export const sendWeeklyPatternsEmail = async (
    to: string,
    userName: string,
    payload: {
        patternCount: number;
        entryCount: number;
        insightsCount: number;
        patterns: Array<{
            title: string;
            patternType: PatternTypeCode;
        }>;
        patternsIconUrl?: string;
    },
): Promise<{ success: boolean; error?: string }> => {
    const { default: WeeklyPatternsEmail } = await import(
        "@/emails/weekly-patterns"
    );

    return sendEmail({
        to,
        subject: "Your weekly patterns are ready.",
        templateName: "weekly-patterns",
        react: WeeklyPatternsEmail({
            userName,
            patternCount: payload.patternCount,
            entryCount: payload.entryCount,
            insightsCount: payload.insightsCount,
            patterns: payload.patterns,
            patternsIconUrl:
                payload.patternsIconUrl ??
                `${APP_URL}/emails/patterns-header-dot-not.png`,
            viewUrl: `${APP_URL}/patterns`,
            recipientEmail: to,
            unsubscribeUrl: NOTIFICATION_SETTINGS_URL,
        }),
    });
};

/**
 * Send progress check ready email.
 */
export const sendProgressCheckEmail = async (
    to: string,
    userName: string,
    headline: string,
    payload: {
        entryCount: number;
        patternsFound: number;
        insightsGiven: number;
        nextMilestone: number;
        progressLabel: string;
        fillPct: number;
    },
): Promise<{ success: boolean; error?: string }> => {
    const { default: ProgressCheckEmail } = await import(
        "@/emails/progress-check"
    );

    return sendEmail({
        to,
        subject: "Your progress check is ready.",
        templateName: "progress-check",
        react: ProgressCheckEmail({
            userName,
            headline,
            entryCount: payload.entryCount,
            patternsFound: payload.patternsFound,
            insightsGiven: payload.insightsGiven,
            nextMilestone: payload.nextMilestone,
            progressLabel: payload.progressLabel,
            fillPct: payload.fillPct,
            viewUrl: `${APP_URL}/progress`,
            activityIconUrl: `${APP_URL}/emails/progress-header-dot-not.png`,
            recipientEmail: to,
            unsubscribeUrl: NOTIFICATION_SETTINGS_URL,
        }),
    });
};

/**
 * Send writing reminder email.
 */
export const sendWritingReminderEmail = async (
    to: string,
    userName: string,
    daysSinceLastEntry: number | null,
): Promise<{ success: boolean; error?: string }> => {
    const { default: WritingReminderEmail } = await import(
        "@/emails/writing-reminder"
    );

    const subject =
        daysSinceLastEntry !== null
            ? `You haven't written in ${daysSinceLastEntry} day${daysSinceLastEntry === 1 ? "" : "s"}.`
            : "You haven't written yet.";

    return sendEmail({
        to,
        subject,
        templateName: "writing-reminder",
        react: WritingReminderEmail({
            userName,
            daysSinceLastEntry,
            writeUrl: `${APP_URL}`,
            recipientEmail: to,
            unsubscribeUrl: NOTIFICATION_SETTINGS_URL,
        }),
    });
};

/**
 * Send waitlist confirmation email.
 */
export const sendWaitlistConfirmationEmail = async (
    to: string,
    waitlistPosition: number,
): Promise<{ success: boolean; error?: string }> => {
    const { default: WaitlistConfirmationEmail } = await import(
        "@/emails/waitlist-confirmation"
    );

    return sendEmail({
        to,
        subject: "You're on the Unsaid waitlist",
        templateName: "waitlist-confirmation",
        react: WaitlistConfirmationEmail({
            email: to,
            waitlistPosition,
            unsubscribeUrl: "mailto:hello@byunsaid.com?subject=Unsubscribe",
        }),
    });
};
