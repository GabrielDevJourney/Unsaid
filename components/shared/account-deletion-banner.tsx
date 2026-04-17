"use client";

import Link from "next/link";
import { useEntitlement } from "@/lib/context/entitlement-context";

const AccountDeletionBanner = () => {
    const { isPendingDeletion, deletionScheduledAt } = useEntitlement();

    if (!isPendingDeletion || !deletionScheduledAt) return null;

    const daysRemaining = Math.max(
        0,
        30 -
            Math.floor((Date.now() - deletionScheduledAt.getTime()) / 86400000),
    );

    return (
        <div className="overflow-hidden max-w-60 transition-[max-width,opacity] duration-400 ease-in-out group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0">
            <div className="mx-4 mb-2 rounded-lg border border-[#d8a058] bg-[#faf4e4] px-3 py-2.5">
                <p className="text-xs font-medium text-[#6a3c08] whitespace-nowrap">
                    Account deletes in {daysRemaining} day
                    {daysRemaining !== 1 ? "s" : ""}
                </p>
                <Link
                    href="/settings"
                    className="whitespace-nowrap text-xs font-bold text-[#6a3c08] underline underline-offset-2 hover:text-[#501c04]"
                >
                    Cancel deletion
                </Link>
            </div>
        </div>
    );
};

export { AccountDeletionBanner };
