import { LinkSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DATE_DISPLAY_LONG, formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/format-utils";
import type {
    SettingsSubscription,
    SubscriptionStatus,
} from "@/lib/settings/service";

interface SubscriptionSectionProps {
    subscription: SettingsSubscription;
}

const STATUS_DISPLAY: Record<
    SubscriptionStatus,
    { label: string; dotClass: string; badgeClass: string }
> = {
    trial: {
        label: "You are on a free trial",
        dotClass: "bg-[#B5B5A8]",
        badgeClass: "border-[#D8D8D2] bg-[#F5F5F2] text-[#6B6B62]",
    },
    active: {
        label: "Your subscription is active",
        dotClass: "bg-[#A1B48E]",
        badgeClass: "border-[#C8D8BE] bg-[#F2F6EE] text-[#5A7046]",
    },
    paused: {
        label: "Your subscription is paused",
        dotClass: "bg-[#C4A882]",
        badgeClass: "border-[#DDD0BC] bg-[#FAF5EE] text-[#7A6040]",
    },
    canceled: {
        label: "Your subscription is canceled",
        dotClass: "bg-[#C49090]",
        badgeClass: "border-[#DDC0C0] bg-[#FAF0F0] text-[#7A4040]",
    },
    expired: {
        label: "Your subscription has expired",
        dotClass: "bg-[#B5B5A8]",
        badgeClass: "border-[#D8D8D2] bg-[#F5F5F2] text-[#6B6B62]",
    },
};

const SubscriptionSection = ({ subscription }: SubscriptionSectionProps) => {
    const {
        status,
        planName,
        priceInCents,
        currentPeriodEnd,
        trialEndsAt,
        customerPortalUrl,
    } = subscription;

    const isTrial = status === "trial";
    const display = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.expired;

    const displayPlan = isTrial ? "Free trial" : (planName ?? "—");
    const billingPeriod = planName?.toLowerCase().includes("year")
        ? "/year"
        : "/month";
    const displayPrice = priceInCents
        ? `${formatPrice(priceInCents)}${billingPeriod}`
        : isTrial
          ? "Free"
          : "—";
    const billingLabel = currentPeriodEnd ? "Next billing" : "Expires";
    const displayNextBilling = currentPeriodEnd
        ? formatDate(currentPeriodEnd, DATE_DISPLAY_LONG)
        : trialEndsAt
          ? formatDate(trialEndsAt, DATE_DISPLAY_LONG)
          : "—";

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

            <div className="overflow-hidden rounded-lg border border-zinc-200 w-1/2">
                <div className="grid grid-cols-3 divide-x divide-zinc-200">
                    <div className="flex flex-col gap-1 px-4 py-3">
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <p className="text-sm text-neutral-600">
                            {displayPlan}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 px-4 py-3">
                        <p className="text-xs text-muted-foreground">Price</p>
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

            {!isTrial && customerPortalUrl && (
                <div className="flex items-center gap-4">
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
                    <Link
                        href={customerPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-700"
                    >
                        Cancel subscription
                    </Link>
                </div>
            )}
        </section>
    );
};

export { SubscriptionSection };
