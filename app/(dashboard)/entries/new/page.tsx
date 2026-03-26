import { EntryEditorPage } from "@/components/entries/entry-editor-page";
import { EntryGate } from "@/components/entries/entry-gate";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/repo";

const NewEntryPage = async () => {
    const supabase = await createSupabaseServer();
    const [canWrite, { data: progress }] = await Promise.all([
        canUserWriteEntry(supabase),
        getUserProgress(supabase),
    ]);

    if (!canWrite && (progress?.totalEntries ?? 0) >= 15) {
        return <EntryGate />;
    }

    return <EntryEditorPage />;
};

export default NewEntryPage;
