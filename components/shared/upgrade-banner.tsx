"use client";

import { useState } from "react";
import { useEntitlement } from "@/lib/context/entitlement-context";
import { MessageBanner } from "./message-banner";

const UpgradeBanner = () => {
    const { isAtFreeLimit } = useEntitlement();
    const [dismissed, setDismissed] = useState(false);

    if (!isAtFreeLimit || dismissed) return null;

    return (
        <MessageBanner
            message={
                <>
                    Unsaid has found{" "}
                    <strong className="font-medium text-slate-600">
                        patterns
                    </strong>{" "}
                    in your writing, unlock full insights with Pro.
                </>
            }
            ctaLabel="See what Pro adds"
            ctaHref="/upgrade"
            variant="info"
            dismissible
            onDismiss={() => setDismissed(true)}
        />
    );
};

export { UpgradeBanner };
