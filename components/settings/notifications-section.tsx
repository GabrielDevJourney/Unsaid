"use client";

import { useState } from "react";
import { updateNotificationPreferencesAction } from "@/app/actions/settings";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences } from "@/lib/users/repo";

interface NotificationsSectionProps {
    preferences: NotificationPreferences;
}

const NOTIFICATION_ITEMS: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
}[] = [
    {
        key: "notifyWritingReminders",
        label: "Writing reminders",
        description: "Gentle nudge if you haven't written in a while",
    },
    {
        key: "notifyWeeklyPatterns",
        label: "Weekly patterns",
        description: "Get notified when new patterns are ready",
    },
    {
        key: "notifyProgressChecks",
        label: "Progress checks",
        description: "Get notified when a new progress insight is ready",
    },
];

const NotificationsSection = ({ preferences }: NotificationsSectionProps) => {
    const [prefs, setPrefs] = useState(preferences);

    const handleToggle = async (
        key: keyof NotificationPreferences,
        value: boolean,
    ) => {
        const previous = prefs;
        setPrefs((prev) => ({ ...prev, [key]: value }));

        const result = await updateNotificationPreferencesAction({
            [key]: value,
        });
        if (result.error) {
            console.error(
                "Failed to save notification preference:",
                result.error,
            );
            setPrefs(previous);
        }
    };

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="pl-2 text-2xl font-medium font-serif italic text-neutral-500">
                    Notifications
                </h2>
                <Separator />
            </div>

            <div className="flex flex-col gap-5 pl-2">
                {NOTIFICATION_ITEMS.map(({ key, label, description }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-bold text-neutral-500">
                                {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        <Switch
                            checked={prefs[key]}
                            onCheckedChange={(value) =>
                                handleToggle(key, value)
                            }
                            variant="sunrise"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export { NotificationsSection };
