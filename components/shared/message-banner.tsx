"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

interface MessageBannerProps {
    message: React.ReactNode;
    ctaLabel: string;
    ctaHref: string;
    variant: "warning" | "info";
    dismissible?: boolean;
    onDismiss?: () => void;
}

const variantStyles = {
    info: "border-slate-300 bg-slate-100 text-slate-500",
    warning: "border-amber-300 bg-amber-50 text-amber-700",
};

const ctaStyles = {
    info: "text-slate-600",
    warning: "text-amber-800",
};

const MessageBanner = ({
    message,
    ctaLabel,
    ctaHref,
    variant,
    dismissible = false,
    onDismiss,
}: MessageBannerProps) => {
    return (
        <div
            className={`flex items-center justify-between rounded-sm border px-4 py-2.5 mb-4 ${variantStyles[variant]}`}
        >
            <p className="text-xs">{message}</p>
            <div className="ml-4 flex shrink-0 items-center gap-3">
                <Link
                    href={ctaHref}
                    className={`text-xs font-bold underline underline-offset-2 ${ctaStyles[variant]}`}
                >
                    {ctaLabel}
                </Link>
                {dismissible && onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="transition-colors hover:opacity-70"
                        aria-label="Dismiss"
                    >
                        <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="size-3.5"
                            strokeWidth={2}
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export { MessageBanner };
