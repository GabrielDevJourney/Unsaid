import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 p-6">{children}</main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
