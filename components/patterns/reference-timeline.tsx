import Link from "next/link";
import { JournalDot } from "@/components/ui/journal-dot";
import type { PatternEvidence } from "@/types";

const MAX_VISIBLE = 3;

interface ReferenceTimelineProps {
    items: PatternEvidence[];
    from: string;
    showAll?: boolean;
    className?: string;
}

/*
 * Measurements (used for the absolute connector line):
 *   left:        px-3(12) + size-5/2(10) = 22px  → circle horizontal center
 *   top/bottom:  py-1.5(6) + size-5/2(10) = 16px → circle vertical center
 */
const ReferenceTimeline = ({
    items,
    from,
    showAll = false,
    className,
}: ReferenceTimelineProps) => {
    const visible = showAll ? items : items.slice(0, MAX_VISIBLE);
    const overflow = showAll ? 0 : items.length - MAX_VISIBLE;

    return (
        <div
            className={`relative bg-neutral-100 flex flex-col shrink-0 w-44 overflow-hidden ${className ?? ""} bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px]
            `}
        >
            <div className="px-5 py-5 flex flex-col gap-3">
                <p className="text-[11px] font-medium text-zinc-500">
                    Reference points
                </p>

                <div className="relative flex flex-col gap-3">
                    {visible.length > 1 && (
                        <div className="absolute ring ring-neutral-500 z-10 left-5 top-4 bottom-4" />
                    )}

                    {visible.map((item) => (
                        <Link
                            key={item.entryId}
                            href={`/entries/${item.entryId}?from=${encodeURIComponent(from)}`}
                            className="relative flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-2 py-1.5 hover:bg-zinc-50 transition-colors"
                        >
                            <JournalDot />
                            <span className="font-sans text-xs text-muted-foreground whitespace-nowrap">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {overflow > 0 && (
                    <p className="text-[11px] font-medium text-zinc-500 pl-10">
                        +{overflow} more
                    </p>
                )}
            </div>
        </div>
    );
};

export { ReferenceTimeline, type ReferenceTimelineProps };
