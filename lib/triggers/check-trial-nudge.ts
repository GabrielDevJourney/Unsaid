import * as Sentry from "@sentry/nextjs";
import { FREE_TRIAL_ENTRIES, TRIAL_ENTRY_NUDGE } from "@/lib/constants";
import { sendTrialEndingEmail } from "@/lib/email/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ServiceResult } from "@/types";

export interface TrialNudgeResult {
    triggered: boolean;
    reason: string;
}

export const checkAndTriggerTrialNudge = async (
    userId: string,
): Promise<ServiceResult<TrialNudgeResult>> => {
    try {
        const supabase = createSupabaseAdmin();

        const { data: sub } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("user_id", userId)
            .single();

        if (sub?.status !== "trial") {
            return { data: { triggered: false, reason: "Not on trial" } };
        }

        const { count } = await supabase
            .from("entries")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);

        if (count !== TRIAL_ENTRY_NUDGE) {
            return {
                data: {
                    triggered: false,
                    reason: `Entry count ${count ?? 0} is not the nudge threshold`,
                },
            };
        }

        const { data: user } = await supabase
            .from("users")
            .select("email, username")
            .eq("user_id", userId)
            .single();

        if (!user?.email) {
            return { data: { triggered: false, reason: "No email found" } };
        }

        const [insightsResult, weeklyInsightsResult] = await Promise.all([
            supabase
                .from("entry_insights")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId),
            supabase.from("weekly_insights").select("id").eq("user_id", userId),
        ]);

        const weeklyInsightIds =
            weeklyInsightsResult.data?.map((item) => item.id) ?? [];

        let patternsFound = 0;
        if (weeklyInsightIds.length > 0) {
            const patternsResult = await supabase
                .from("weekly_insight_patterns")
                .select("id", { count: "exact", head: true })
                .in("weekly_insight_id", weeklyInsightIds);
            patternsFound = patternsResult.count ?? 0;
        }

        const emailResult = await sendTrialEndingEmail(
            user.email,
            user.username,
            FREE_TRIAL_ENTRIES - TRIAL_ENTRY_NUDGE,
            {
                entriesWritten: TRIAL_ENTRY_NUDGE,
                patternsFound,
                insightsReceived: insightsResult.count ?? 0,
            },
        );

        if (!emailResult.success) {
            console.error("Trial nudge email failed:", emailResult.error);
            return { data: { triggered: false, reason: "Email send failed" } };
        }

        return {
            data: {
                triggered: true,
                reason: `Trial nudge sent at ${TRIAL_ENTRY_NUDGE} entries`,
            },
        };
    } catch (error) {
        Sentry.withScope((scope) => {
            scope.setTag("feature", "trigger.trial-nudge");
            scope.setFingerprint(["trigger-failure", "trial-nudge"]);
            scope.setContext("trigger", { userId });
            Sentry.captureException(error);
        });
        console.error("Trial nudge trigger failed:", error);
        return {
            data: {
                triggered: false,
                reason: "Internal error during trial nudge check",
            },
        };
    }
};
