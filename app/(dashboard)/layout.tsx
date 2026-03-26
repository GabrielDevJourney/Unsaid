import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EntitlementProvider } from "@/lib/context/entitlement-context";
import { getUnviewedProgressInsightsCount } from "@/lib/progress-insights/service";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/repo";
import { getNewPatternsCount } from "@/lib/weekly-insights/service";

const Layout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const supabase = await createSupabaseServer();
    const [
        { data: newPatternsCount },
        { data: newProgressCount },
        canWrite,
        { data: progressData },
    ] = await Promise.all([
        getNewPatternsCount(supabase),
        getUnviewedProgressInsightsCount(supabase),
        canUserWriteEntry(supabase),
        getUserProgress(supabase),
    ]);

    const isAtFreeLimit = (progressData?.totalEntries ?? 0) >= 15 && !canWrite;

    return (
        <div className="flex h-svh">
            <EntitlementProvider isAtFreeLimit={isAtFreeLimit}>
                <SidebarProvider>
                    <AppSidebar
                        newPatternsCount={newPatternsCount ?? 0}
                        newProgressCount={newProgressCount ?? 0}
                    />
                    <main className="flex-1 overflow-hidden">{children}</main>
                </SidebarProvider>
            </EntitlementProvider>
        </div>
    );
};

export default Layout;
