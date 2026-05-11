import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import { getHomePageData } from "@/lib/home/service";
import { getPersona } from "@/lib/persona/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const HomePage = async () => {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const supabase = await createSupabaseServer();

    const [homeData, personaResult] = await Promise.all([
        getHomePageData(supabase),
        getPersona(supabase, userId),
    ]);

    const {
        entries,
        hasMore,
        totalEntriesAllTime,
        totalPatternsCount,
        entryDates,
    } = homeData;

    const needsSummary = !!personaResult.data && !personaResult.data.summary;

    let userName = personaResult.data?.displayName ?? "";
    if (!userName) {
        const clerkUser = await currentUser();
        userName = clerkUser?.firstName ?? clerkUser?.username ?? "";
    }

    return (
        <HomeView
            entries={entries.map((entry) => ({ entry }))}
            initialHasMore={hasMore}
            userName={userName}
            totalEntriesAllTime={totalEntriesAllTime}
            totalPatternsCount={totalPatternsCount}
            entryDates={entryDates}
            needsSummary={needsSummary}
        />
    );
};

export default HomePage;
