import { LinkSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FREE_TRIAL_ENTRIES } from "@/lib/constants";
import { DATE_DISPLAY_LONG, formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/format-utils";
import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import type { SettingsSubscription } from "@/lib/settings/service";
import { UpgradePlanButton } from "./upgrade-plan-button";

interface SubscriptionSectionProps {
    subscription: SettingsSubscription;
}

const STATUS_DISPLAY: Record<
    SubscriptionStatusType,
    {
        label: string;
        dotClass: string;
        badgeClass: string;
        filledDotClass: string;
    }
> = {
    // Calm confidence — safe, healthy, all good
    active: {
        label: "Your subscription is active",
        dotClass: "bg-[#A1B48E]",
        badgeClass: "border-[#C8D8BE] bg-[#F2F6EE] text-[#5A7046]",
        filledDotClass: "border-[#8FA87A] bg-[#A1B48E]",
    },
    // Curiosity + gentle urgency — warm amber, clock is ticking
    trial: {
        label: "You are on a free trial",
        dotClass: "bg-[#FCE8BC]",
        badgeClass: "border-[#FAE4B4] bg-[#FFFDF5] text-[#8B5A10]",
        filledDotClass: "border-[#FAD99A] bg-[#FCE8BC]",
    },
    // Neutral suspension — cool blue, calm and waiting
    paused: {
        label: "Your subscription is paused",
        dotClass: "bg-[#7A9BB5]",
        badgeClass: "border-[#B8D0E8] bg-[#EEF4FA] text-[#2E5C7A]",
        filledDotClass: "border-[#5C85A0] bg-[#7A9BB5]",
    },
    // Soft regret, winback — subtle dusty red, not alarming
    canceled: {
        label: "Your subscription is canceled",
        dotClass: "bg-[#C49898]",
        badgeClass: "border-[#DEC0C0] bg-[#FAF2F2] text-[#7A3A3A]",
        filledDotClass: "border-[#B08080] bg-[#C49898]",
    },
    // Urgent, fix now — burnt orange, action needed
    unpaid: {
        label: "Payment issue, update your payment method",
        dotClass: "bg-[#C47A50]",
        badgeClass: "border-[#E0C0A0] bg-[#FAF0E8] text-[#7A3A10]",
        filledDotClass: "border-[#B06030] bg-[#C47A50]",
    },
    // Definitive end, re-engage — muted red, door is closed
    expired: {
        label: "Your subscription has expired",
        dotClass: "bg-[#B06060]",
        badgeClass: "border-[#DDAAAA] bg-[#FAF0F0] text-[#6A2020]",
        filledDotClass: "border-[#9A4848] bg-[#B06060]",
    },
};

const SubscriptionSection = ({ subscription }: SubscriptionSectionProps) => {
    const {
        status,
        planName,
        priceInCents,
        currentPeriodEnd,
        trialEntriesUsed,
        trialEntriesLimit,
        customerPortalUrl,
    } = subscription;

    const isTrial = status === "trial";
    const display = STATUS_DISPLAY[status];

    const displayPlan = planName ?? "—";
    const displayPrice = priceInCents ? formatPrice(priceInCents) : "—";
    const billingLabel = currentPeriodEnd ? "Next billing" : "Expires";
    const displayNextBilling = currentPeriodEnd
        ? formatDate(currentPeriodEnd, DATE_DISPLAY_LONG)
        : "—";

    const limit = trialEntriesLimit ?? FREE_TRIAL_ENTRIES;
    const used = trialEntriesUsed ?? 0;
    const trialDots = Array.from({ length: limit }, (_, i) => ({
        id: `trial-dot-${i}`,
        filled: i < used,
    }));

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl pl-2 font-medium font-serif italic text-neutral-500">
                    Subscription
                </h2>
                <div
                    className={`flex items-center gap-2 rounded-md border-2 px-4 py-1.5 text-sm ${display.badgeClass}`}
                >
                    <span
                        className={`size-2 shrink-0 rounded-full ${display.dotClass}`}
                    />
                    {display.label}
                </div>
            </div>

            <Separator />

            {isTrial && trialEntriesUsed !== null && (
                <div className="overflow-hidden rounded-lg border border-neutral-300 w-1/2">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">
                                Entries used
                            </p>
                            <p className="text-sm font-bold text-neutral-500">
                                {used} of {limit}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {trialDots.map((dot) => (
                                <div
                                    key={dot.id}
                                    className={`relative size-3.5 shrink-0 rounded-full border-2 ${dot.filled ? display.filledDotClass : "border-zinc-300 bg-neutral-300"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isTrial && (
                <div className="overflow-hidden rounded-lg border border-zinc-200 w-1/2">
                    <div className="grid grid-cols-3 divide-x divide-zinc-200">
                        <div className="flex flex-col gap-1 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Plan
                            </p>
                            <p className="text-sm text-neutral-600">
                                {displayPlan}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Price
                            </p>
                            <p className="text-sm text-neutral-600">
                                {displayPrice}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                {billingLabel}
                            </p>
                            <p className="text-sm text-neutral-600">
                                {displayNextBilling}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                {(status === "trial" || status === "expired") && (
                    <UpgradePlanButton />
                )}

                {(status === "active" ||
                    status === "paused" ||
                    status === "canceled") &&
                    customerPortalUrl && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="bg-white py-4"
                            >
                                <Link
                                    href={customerPortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground text-sm font-normal"
                                >
                                    <HugeiconsIcon icon={LinkSquare01Icon} />
                                    Manage subscription
                                </Link>
                            </Button>
                            {/* Both links go to the same portal — Lemon Squeezy handles cancellation within it */}
                            {status === "active" && (
                                <Link
                                    href={customerPortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-700"
                                >
                                    Cancel subscription
                                </Link>
                            )}
                        </>
                    )}

                {status === "unpaid" && customerPortalUrl && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-white py-4"
                    >
                        <Link
                            href={customerPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground text-sm font-normal"
                        >
                            <HugeiconsIcon icon={LinkSquare01Icon} />
                            Fix payment
                        </Link>
                    </Button>
                )}
            </div>
        </section>
    );
};

export { SubscriptionSection };
