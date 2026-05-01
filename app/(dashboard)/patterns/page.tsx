import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PatternsView } from "@/components/patterns/patterns-view";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    getNewPatternsCount,
    getWeeklyInsightWithPatternsPaginated,
} from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

const INITIAL_LIMIT = 5;

const PatternsPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    const [insightsResult, newCountResult] = await Promise.all([
        getWeeklyInsightWithPatternsPaginated(supabase, null, INITIAL_LIMIT),
        getNewPatternsCount(supabase),
    ]);

    const insights = isServiceError(insightsResult)
        ? []
        : insightsResult.data.insights;
    const nextCursor = isServiceError(insightsResult)
        ? null
        : insightsResult.data.nextCursor;
    const initialNewCount = isServiceError(newCountResult)
        ? 0
        : newCountResult.data;

    return (
        <PatternsView
            insights={insights}
            initialCursor={nextCursor}
            initialNewCount={initialNewCount ?? 0}
        />
    );
};

export default PatternsPage;
