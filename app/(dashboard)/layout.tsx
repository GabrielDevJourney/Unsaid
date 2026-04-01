import { headers } from "next/headers";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getUnviewedProgressInsightsCount } from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getNewPatternsCount } from "@/lib/weekly-insights/service";

const Layout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const supabase = await createSupabaseServer();
    const [{ data: newPatternsCount }, { data: newProgressCount }] =
        await Promise.all([
            getNewPatternsCount(supabase),
            getUnviewedProgressInsightsCount(supabase),
        ]);

    // Role is forwarded by middleware — avoids a redundant DB round-trip
    const isAdmin = (await headers()).get("x-user-role") === "admin";

    return (
        <div className="flex h-svh">
            <SidebarProvider>
                <AppSidebar
                    newPatternsCount={newPatternsCount ?? 0}
                    newProgressCount={newProgressCount ?? 0}
                    isAdmin={isAdmin}
                />
                <main className="flex-1 overflow-hidden">{children}</main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
