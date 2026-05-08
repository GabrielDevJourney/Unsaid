import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import { getHomePageData } from "@/lib/home/service";
import { ensureInitialPersonaSummary, getPersona } from "@/lib/persona/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const HomePage = async () => {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const supabase = await createSupabaseServer();
    const {
        entries,
        hasMore,
        totalEntriesAllTime,
        totalPatternsCount,
        entryDates,
    } = await getHomePageData(supabase);

    const { data: persona } = await getPersona(supabase, user.id);
    if (persona && !persona.summary) {
        await ensureInitialPersonaSummary(supabase, user.id);
    }

    return (
        <HomeView
            entries={entries.map((entry) => ({ entry }))}
            initialHasMore={hasMore}
            userName={user.username ?? ""}
            totalEntriesAllTime={totalEntriesAllTime}
            totalPatternsCount={totalPatternsCount}
            entryDates={entryDates}
        />
    );
};

export default HomePage;
