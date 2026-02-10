import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex h-svh">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 overflow-hidden">{children}</main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
