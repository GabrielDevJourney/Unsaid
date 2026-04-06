import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FoggyBlurOverlay } from "@/components/shared/foggy-blur-overlay";
import { cn } from "@/lib/utils";

interface LockedPreviewCardProps {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    title: string;
    subtitle: React.ReactNode;
    extra?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    showLock?: boolean;
    titleSize?: "xl" | "md";
}

const LockedPreviewCard = ({
    icon,
    title,
    subtitle,
    extra,
    children,
    className,
    showLock = true,
    titleSize = "xl",
}: LockedPreviewCardProps) => (
    <div
        className={cn(
            "flex flex-col rounded-xl border border-neutral-300 bg-[#D9D9D9]/30 overflow-hidden min-w-50 h-70",
            className,
        )}
    >
        <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
                <div className="bg-white border border-border rounded-md p-1.5">
                    <HugeiconsIcon
                        icon={icon}
                        strokeWidth={1}
                        className="size-5 text-neutral-400"
                    />
                </div>
                {showLock && (
                    <HugeiconsIcon
                        icon={SquareLock02Icon}
                        className="size-4 text-neutral-400"
                    />
                )}
            </div>
            <h3
                className={cn(
                    "mt-2 font-serif italic text-neutral-500",
                    titleSize === "md" ? "text-md" : "text-xl",
                )}
            >
                {title}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-snug">
                {subtitle}
            </p>
        </div>
        {extra && <div className="px-5 pt-3">{extra}</div>}
        <div className="relative mt-4 flex-1 min-h-0 overflow-hidden pointer-events-none">
            {children}
            <FoggyBlurOverlay />
        </div>
    </div>
);

export { LockedPreviewCard };
