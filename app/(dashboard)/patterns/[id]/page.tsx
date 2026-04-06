import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { PatternDetailPage } from "@/components/patterns/pattern-detail-page";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    getPatternById,
    markPatternAsViewed,
} from "@/lib/weekly-insights/service";

interface Props {
    params: Promise<{ id: string }>;
}

const PatternPage = async ({ params }: Props) => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: pattern } = await getPatternById(supabase, id);
    if (!pattern) notFound();

    after(markPatternAsViewed(supabase, id));

    return <PatternDetailPage pattern={pattern} />;
};

export default PatternPage;
