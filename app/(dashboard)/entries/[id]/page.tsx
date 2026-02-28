import { redirect } from "next/navigation";
import { EntryEditorPage } from "@/components/entries/entry-editor-page";
import { getEntryWithInsight } from "@/lib/entries/service";
import { createSupabaseServer } from "@/lib/supabase/server";

interface PageProps {
    params: Promise<{ id: string }>;
}

const EntryPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const supabase = await createSupabaseServer();
    const { data: entry } = await getEntryWithInsight(supabase, id);

    if (!entry) redirect("/home");

    return (
        <EntryEditorPage
            initialEntry={{
                id: entry.id,
                content: entry.content,
                insight: entry.entryInsight,
                createdAt: entry.createdAt,
            }}
        />
    );
};

export default EntryPage;
