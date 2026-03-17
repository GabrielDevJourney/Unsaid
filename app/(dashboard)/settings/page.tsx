import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";
import { getSettingsPageData } from "@/lib/settings/service";

const SettingsPage = async () => {
    const pageData = await getSettingsPageData();
    if (!pageData) redirect("/sign-in");

    return <SettingsView user={pageData.user} />;
};

export default SettingsPage;
