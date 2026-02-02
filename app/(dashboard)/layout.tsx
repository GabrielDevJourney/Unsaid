const DashboardLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex min-h-screen">
            <aside className="w-60 border-r bg-sidebar" />
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
};

export default DashboardLayout;
