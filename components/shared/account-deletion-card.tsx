"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cancelScheduledDeletionAction } from "@/app/actions/users";
import { useEntitlement } from "@/lib/context/entitlement-context";

const AccountDeletionBanner = () => {
    const { isPendingDeletion, deletionScheduledAt } = useEntitlement();
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!isPendingDeletion) setIsCancelling(false);
    }, [isPendingDeletion]);

    if (!isPendingDeletion || !deletionScheduledAt) return null;

    const daysRemaining = Math.max(
        0,
        30 -
            Math.floor((Date.now() - deletionScheduledAt.getTime()) / 86400000),
    );

    const handleCancelDeletion = async () => {
        setIsCancelling(true);
        try {
            const result = await cancelScheduledDeletionAction();
            if ("error" in result) {
                setIsCancelling(false);
                return;
            }
            router.refresh();
        } catch {
            setIsCancelling(false);
        }
    };

    return (
        <div className="overflow-hidden max-w-60 transition-[max-width,opacity] duration-400 ease-in-out group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0">
            <div className="mx-4 mb-2 rounded-lg border border-[#d8a058] bg-[#faf4e4] px-3 py-2.5">
                <p className="text-xs font-medium text-[#6a3c08] whitespace-nowrap">
                    Account deletes in {daysRemaining} day
                    {daysRemaining !== 1 ? "s" : ""}
                </p>
                <button
                    type="button"
                    onClick={handleCancelDeletion}
                    disabled={isCancelling}
                    className="whitespace-nowrap text-xs font-bold text-[#6a3c08] underline underline-offset-2 hover:text-[#501c04] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isCancelling ? "Cancelling..." : "Cancel deletion"}
                </button>
            </div>
        </div>
    );
};

export { AccountDeletionBanner };
