import Link from "next/link";
import { formatDate } from "@/lib/date-utils";
import type { ProgressInsight } from "@/types";

interface ProgressCardProps {
    insight: ProgressInsight;
}

const ProgressCard = ({ insight }: ProgressCardProps) => {
    const { parsedContent, createdAt, id } = insight;

    const headline = parsedContent?.headline ?? null;
    const preview = parsedContent?.whatsOnRepeat ?? null;
    const isMilestone = parsedContent?.isMilestone ?? false;

    const date = formatDate(createdAt, {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });

    return (
        <Link
            href={`/progress/${id}`}
            className="group block border border-border rounded-xl shadow-sm"
        >
            <div className="relative rounded-xl bg-neutral-200 bg-[radial-gradient(circle,rgba(73,73,74,0.2)_1px,transparent_1px)] bg-size-[6px_6px] pt-4 px-6 flex flex-col gap-4">
                {/* blur overlay */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl backdrop-blur-md mask-[radial-gradient(circle_at_top_left,black_0%,transparent_70%)]" />

                {/* Top row: date + optional milestone badge */}
                <div className="flex items-center gap-4 px-2 relative z-10">
                    <span className="text-xs text-neutral-500">{date}</span>
                    {isMilestone && (
                        <span className="inline-flex items-center rounded-full bg-muted-foreground px-4 py-1 text-xs font-medium text-white">
                            Milestone reached
                        </span>
                    )}
                </div>

                {/* Inner white card */}
                <div className="bg-white rounded-t-xl pt-6 flex flex-col gap-4 group-hover:shadow-sm transition-shadow relative z-10">
                    {headline ? (
                        <h3 className="font-serif text-2xl px-6 italic text-muted-foreground line-clamp-2 leading-snug">
                            {headline}
                        </h3>
                    ) : (
                        <h3 className="font-serif text-2xl italic px-6 text-zinc-400 line-clamp-2 leading-snug">
                            Reflection
                        </h3>
                    )}
                    {preview && (
                        <div className="relative max-h-32 overflow-hidden px-6">
                            {/* Layer 1: The Sharp Text (Top) */}
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {preview}
                            </p>

                            {/* Layer 2: The Blurred "Overlay" (Bottom Only) */}
                            <div
                                className="absolute inset-0 px-6 bg-white pointer-events-none"
                                style={{
                                    clipPath: "inset(70% 0 0 0)", // Only shows the bottom 40%
                                    maskImage:
                                        "linear-gradient(to bottom, transparent, black 50%)", // Softens the "cut" line
                                }}
                            >
                                <p className="text-lg text-muted-foreground leading-relaxed blur-[2px]">
                                    {preview}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export { ProgressCard };
