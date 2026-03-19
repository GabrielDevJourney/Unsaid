import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";
import { getSettingsPageData } from "@/lib/settings/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const SettingsPage = async () => {
    const supabase = await createSupabaseServer();
    const pageData = await getSettingsPageData(supabase);
    if (!pageData) redirect("/sign-in");

    return (
        <SettingsView
            user={pageData.user}
            subscription={pageData.subscription}
            notifications={pageData.notifications}
        />
    );
};

export default SettingsPage;
