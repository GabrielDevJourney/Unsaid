import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { ProgressDetail } from "@/components/progress/progress-detail";
import { getEntryReflectionPreviews } from "@/lib/entries/service";
import {
    getProgressInsightDetail,
    markProgressInsightViewed,
} from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";

interface Props {
    params: Promise<{ id: string }>;
}

const ProgressInsightPage = async ({ params }: Props) => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { id } = await params;
    const supabase = await createSupabaseServer();

    const [result, { data: reflections }] = await Promise.all([
        getProgressInsightDetail(supabase, id),
        getEntryReflectionPreviews(supabase, "progress", id),
    ]);

    if (!result) notFound();

    if (!result.insight.isViewed) {
        after(markProgressInsightViewed(supabase, id));
    }

    return (
        <ProgressDetail
            insight={result.insight}
            keyEntryData={result.keyEntryData}
            reflections={reflections ?? []}
        />
    );
};

export default ProgressInsightPage;
