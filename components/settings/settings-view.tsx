import { PageHeader } from "@/components/layout/page-header";
import type { SettingsUser } from "@/lib/settings/service";
import { AccountSection } from "./account-section";

interface SettingsViewProps {
    user: SettingsUser;
}

const SettingsView = ({ user }: SettingsViewProps) => {
    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader>
                <h1 className="font-serif text-4xl italic text-zinc-600">
                    Settings
                </h1>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-10 py-8 flex flex-col gap-10">
                    <AccountSection user={user} />
                </div>
            </div>
        </div>
    );
};

export { SettingsView, type SettingsViewProps };
