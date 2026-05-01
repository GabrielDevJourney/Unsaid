import { headers } from "next/headers";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EntitlementProvider } from "@/lib/context/entitlement-context";
import { getUnviewedProgressInsightsCount } from "@/lib/progress-insights/service";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAccountDeletionStatus, getUserProgress } from "@/lib/users/service";
import { getNewPatternsCount } from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

const Layout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const supabase = await createSupabaseServer();
    const [
        newPatternsCountResult,
        newProgressCountResult,
        canWrite,
        progressResult,
        deletionStatusResult,
    ] = await Promise.all([
        getNewPatternsCount(supabase),
        getUnviewedProgressInsightsCount(supabase),
        canUserWriteEntry(supabase),
        getUserProgress(supabase),
        getAccountDeletionStatus(supabase),
    ]);

    const newPatternsCount = isServiceError(newPatternsCountResult)
        ? 0
        : newPatternsCountResult.data;
    const newProgressCount = isServiceError(newProgressCountResult)
        ? 0
        : newProgressCountResult.data;
    const progressData = isServiceError(progressResult)
        ? null
        : progressResult.data;
    const deletionStatus = isServiceError(deletionStatusResult)
        ? null
        : deletionStatusResult.data;

    const isAtFreeLimit = (progressData?.totalEntries ?? 0) >= 15 && !canWrite;
    const isPendingDeletion = deletionStatus?.deletedAt != null;
    const deletionScheduledAt = deletionStatus?.deletedAt
        ? new Date(deletionStatus.deletedAt)
        : null;
    // Role is forwarded by middleware — avoids a redundant DB round-trip
    const isAdmin = (await headers()).get("x-user-role") === "admin";

    return (
        <div className="flex h-svh">
            <EntitlementProvider
                isAtFreeLimit={isAtFreeLimit}
                isPendingDeletion={isPendingDeletion}
                deletionScheduledAt={deletionScheduledAt}
            >
                <SidebarProvider>
                    <AppSidebar
                        newPatternsCount={newPatternsCount ?? 0}
                        newProgressCount={newProgressCount ?? 0}
                        isAdmin={isAdmin}
                    />
                    <main className="flex-1 overflow-hidden">{children}</main>
                </SidebarProvider>
            </EntitlementProvider>
        </div>
    );
};

export default Layout;
