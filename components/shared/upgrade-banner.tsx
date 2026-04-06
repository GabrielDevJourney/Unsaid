"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { useEntitlement } from "@/lib/context/entitlement-context";

const UpgradeBanner = () => {
    const { isAtFreeLimit } = useEntitlement();
    const [dismissed, setDismissed] = useState(false);

    if (!isAtFreeLimit || dismissed) return null;

    return (
        <div className="flex items-center justify-between rounded-sm border border-slate-300 bg-slate-100 px-4 py-2.5 mb-4">
            <p className="text-xs text-slate-500">
                Unsaid has found{" "}
                <strong className="font-medium text-slate-600">patterns</strong>{" "}
                in your writing, unlock full insights with Pro.
            </p>
            <div className="ml-4 flex shrink-0 items-center gap-3">
                <Link
                    href="/upgrade"
                    className="text-xs font-medium text-slate-600 underline underline-offset-2"
                >
                    See what Pro adds
                </Link>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="text-slate-400 transition-colors hover:text-slate-600"
                    aria-label="Dismiss"
                >
                    <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="size-3.5"
                        strokeWidth={2}
                    />
                </button>
            </div>
        </div>
    );
};

export { UpgradeBanner };
