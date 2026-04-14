import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BackstageNav } from "@/components/admin/backstage-nav";
import { PageHeader } from "@/components/layout/page-header";
import { isAdmin } from "@/lib/auth/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

const BackstageLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) redirect("/home");

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/home">
                <h1 className="font-serif text-3xl italic text-zinc-800">
                    Backstage
                </h1>
            </PageHeader>
            <BackstageNav />
            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    );
};

export default BackstageLayout;
