import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import { getUserEntriesWithInsights } from "@/lib/entries/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const HomePage = async () => {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userName = user?.username;

    const supabase = await createSupabaseServer();
    const { data } = await getUserEntriesWithInsights(supabase);
    const entries = (data ?? []).map((entry) => ({ entry }));

    return (
        <HomeView
            entries={entries}
            totalEntries={entries.length}
            userName={userName ?? ""}
        />
    );
};

export default HomePage;
