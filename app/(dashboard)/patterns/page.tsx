import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PatternsView } from "@/components/patterns/patterns-view";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    getNewPatternsCount,
    getWeeklyInsightWithPatternsPaginated,
} from "@/lib/weekly-insights/service";

const INITIAL_LIMIT = 5;

const PatternsPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    const [{ data: insights, nextCursor }, { data: initialNewCount }] =
        await Promise.all([
            getWeeklyInsightWithPatternsPaginated(
                supabase,
                null,
                INITIAL_LIMIT,
            ),
            getNewPatternsCount(supabase),
        ]);

    return (
        <PatternsView
            insights={insights}
            initialCursor={nextCursor}
            initialNewCount={initialNewCount ?? 0}
        />
    );
};

export default PatternsPage;
