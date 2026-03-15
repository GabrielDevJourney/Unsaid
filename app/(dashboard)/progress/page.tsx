import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProgressView } from "@/components/progress/progress-view";
import { getProgressInsightsPage } from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const ProgressPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    const { insights, totalInsights, totalEntries, entryCountAtLastProgress } =
        await getProgressInsightsPage(supabase, userId);

    return (
        <ProgressView
            insights={insights}
            totalInsights={totalInsights}
            totalEntries={totalEntries}
            entryCountAtLastProgress={entryCountAtLastProgress}
        />
    );
};

export default ProgressPage;
