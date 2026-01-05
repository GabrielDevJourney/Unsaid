import type { ReactElement } from "react";
import { Resend } from "resend";

const FROM_EMAIL = "Unsaid <noreply@emails.byunsaid.com>";
const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://emails.byunsaid.com";

interface SendEmailParams {
    to: string;
    subject: string;
    react: ReactElement;
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
}: SendEmailParams): Promise<{ success: boolean; error?: string }> => {
    try {
        const resend = getResend();

        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            react,
        });

        if (error) {
            console.error("Email send error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error("Email send failed:", err);
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
    stats: { entriesWritten: number; insightsReceived: number },
): Promise<{ success: boolean; error?: string }> => {
    const { default: TrialEndingEmail } = await import("@/emails/trial-ending");

    return sendEmail({
        to,
        subject: `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
        react: TrialEndingEmail({
            userName,
            daysRemaining,
            entriesWritten: stats.entriesWritten,
            insightsReceived: stats.insightsReceived,
            upgradeUrl: `${APP_URL}/settings`,
        }),
    });
};

/**
 * Send weekly patterns ready email.
 */
export const sendWeeklyPatternsEmail = async (
    to: string,
    userName: string,
    patternCount: number,
    patternPreviews: string[],
): Promise<{ success: boolean; error?: string }> => {
    const { default: WeeklyPatternsEmail } = await import(
        "@/emails/weekly-patterns"
    );

    return sendEmail({
        to,
        subject: "Your weekly patterns are ready 📊",
        react: WeeklyPatternsEmail({
            userName,
            patternCount,
            patternPreviews,
            viewUrl: `${APP_URL}/patterns`,
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
    entryCount: number,
): Promise<{ success: boolean; error?: string }> => {
    const { default: ProgressCheckEmail } = await import(
        "@/emails/progress-check"
    );

    return sendEmail({
        to,
        subject: "Your progress check is ready 💡",
        react: ProgressCheckEmail({
            userName,
            headline,
            entryCount,
            viewUrl: `${APP_URL}/progress`,
        }),
    });
};
