import Link from "next/link";
import { JournalDot } from "@/components/ui/journal-dot";

const MAX_VISIBLE = 3;

const MONTH_ABBREVS: Record<string, string> = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
};

const abbreviateMonth = (label: string): string =>
    label.replace(
        /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
        (m) =>
            MONTH_ABBREVS[
                m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
            ] ?? m,
    );

interface ReferenceItem {
    id: string;
    label: string;
}

interface ReferenceTimelineProps {
    items: ReferenceItem[];
    from: string;
    showAll?: boolean;
    className?: string;
}

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
            className={`relative bg-neutral-100 flex flex-col shrink-0 w-32 md:w-44 overflow-hidden bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px] ${className ?? ""}`}
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
                            key={item.id}
                            href={`/entries/${item.id}?from=${encodeURIComponent(from)}`}
                            className="relative flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-2 py-1.5 hover:bg-zinc-50 transition-colors"
                        >
                            <JournalDot />
                            <span className="hidden md:block font-sans text-xs text-muted-foreground whitespace-nowrap">
                                {item.label}
                            </span>
                            <span className="md:hidden font-sans text-xs text-muted-foreground whitespace-nowrap">
                                {abbreviateMonth(item.label)}
                            </span>
                        </Link>
                    ))}
                </div>

                {overflow > 0 && (
                    <p className="text-[12px] font-medium text-zinc-500 pl-10">
                        +{overflow} more
                    </p>
                )}
            </div>
        </div>
    );
};

export { ReferenceTimeline, type ReferenceTimelineProps, type ReferenceItem };
