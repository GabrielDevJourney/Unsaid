import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import { getHomePageData } from "@/lib/home/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const HomePage = async () => {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const supabase = await createSupabaseServer();
    const { entries, asideTotalEntries, weeklyInsightsCount, entryDates } =
        await getHomePageData(supabase);

    return (
        <HomeView
            entries={entries.map((entry) => ({ entry }))}
            totalEntries={entries.length}
            userName={user.username ?? ""}
            asideTotalEntries={asideTotalEntries}
            weeklyInsightsCount={weeklyInsightsCount}
            entryDates={entryDates}
        />
    );
};

export default HomePage;
