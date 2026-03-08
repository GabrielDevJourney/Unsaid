import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getNewPatternsCount } from "@/lib/weekly-insights/service";

const Layout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const supabase = await createSupabaseServer();
    const { data: newPatternsCount } = await getNewPatternsCount(supabase);

    return (
        <div className="flex h-svh">
            <SidebarProvider>
                <AppSidebar newPatternsCount={newPatternsCount ?? 0} />
                <main className="flex-1 overflow-hidden">{children}</main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
