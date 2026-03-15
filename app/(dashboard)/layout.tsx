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

    return (
        <div className="flex h-svh">
            <SidebarProvider>
                <AppSidebar
                    newPatternsCount={newPatternsCount ?? 0}
                    newProgressCount={newProgressCount ?? 0}
                />
                <main className="flex-1 overflow-hidden">{children}</main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
