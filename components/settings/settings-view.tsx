import { PageHeader } from "@/components/layout/page-header";
import type {
    SettingsSubscription,
    SettingsUser,
} from "@/lib/settings/service";
import type { NotificationPreferences } from "@/lib/users/repo";
import { AccountSection } from "./account-section";
import { DangerZoneSection } from "./danger-zone-section";
import { NotificationsSection } from "./notifications-section";
import { SecuritySection } from "./security-section";
import { SubscriptionSection } from "./subscription-section";

interface SettingsViewProps {
    user: SettingsUser;
    subscription: SettingsSubscription;
    notifications: NotificationPreferences;
}

const SettingsView = ({
    user,
    subscription,
    notifications,
}: SettingsViewProps) => {
    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader>
                <h1 className="font-serif text-4xl italic text-zinc-600">
                    Settings
                </h1>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-10 py-8 flex flex-col gap-10">
                    <AccountSection user={user} />
                    <SecuritySection email={user.email} />
                    <SubscriptionSection subscription={subscription} />
                    <NotificationsSection preferences={notifications} />
                    <DangerZoneSection />
                </div>
            </div>
        </div>
    );
};

export { SettingsView, type SettingsViewProps };
