"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ReferenceTimeline } from "@/components/shared/reference-timeline";
import { formatDate } from "@/lib/date-utils";
import type { ProgressInsight } from "@/types";

interface KeyEntryItem {
    id: string;
    entryNumber: number;
    createdAt: string;
}

const formatEntryLabel = (createdAt: string) =>
    formatDate(createdAt, { month: "long", day: "numeric" });

interface ProgressDetailProps {
    insight: ProgressInsight;
    keyEntryData: KeyEntryItem[];
}

const ProgressDetail = ({ insight, keyEntryData }: ProgressDetailProps) => {
    const { parsedContent, createdAt } = insight;

    const date = formatDate(createdAt, {
        year: "numeric",
        month: "long",
        day: "2-digit",
    });

    const referenceItems = keyEntryData.map((item) => ({
        id: item.id,
        label: formatEntryLabel(item.createdAt),
    }));

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/progress">
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="font-serif text-4xl italic text-zinc-800">
                        Reflection
                    </h1>
                    <p className="text-sm text-muted-foreground">{date}</p>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-hidden">
                <div className="flex h-full gap-16 px-10 bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px]">
                    {/* Left: reference panel — stays in place while content scrolls */}
                    {referenceItems.length > 0 && (
                        <div className="shrink-0 py-10">
                            <div className="rounded-xl border border-border overflow-hidden shadow-md">
                                <ReferenceTimeline
                                    items={referenceItems}
                                    from={`/progress/${insight.id}`}
                                    showAll
                                />
                            </div>
                        </div>
                    )}

                    {/* Right: card itself scrolls */}
                    <div className="flex-1 flex flex-col pt-10 pr-6 min-w-0 overflow-hidden">
                        {parsedContent ? (
                            <div className="w-full h-full rounded-2xl overflow-hidden">
                                <div className="flex flex-col gap-10 h-full overflow-y-auto bg-zinc-50 p-8 [&::-webkit-scrollbar]:w-0">
                                    {/* Headline */}
                                    <h2 className="font-serif text-4xl italic text-neutral-500 leading-relaxed">
                                        {parsedContent.headline}
                                    </h2>

                                    {/* What's on repeat */}
                                    <p className="text-base text-zinc-600 leading-relaxed">
                                        {parsedContent.whatsOnRepeat}
                                    </p>

                                    {/* What changed */}
                                    <div className="flex flex-col gap-2">
                                        <p className="font-semibold text-zinc-700">
                                            What changed?
                                        </p>
                                        <p className="text-base text-zinc-600 leading-relaxed">
                                            {parsedContent.whatChanged}
                                        </p>
                                    </div>

                                    {/* Small experiment */}
                                    <div className="flex flex-col gap-2">
                                        <p className="font-semibold text-zinc-700">
                                            Small experiment
                                        </p>
                                        <p className="text-base text-zinc-600 leading-relaxed">
                                            {parsedContent.experiment}
                                        </p>
                                    </div>

                                    {/* Reality check */}
                                    <div className="flex flex-col gap-2">
                                        <p className="font-semibold text-zinc-700">
                                            Reality check
                                        </p>
                                        <p className="text-base text-zinc-600 leading-relaxed">
                                            {parsedContent.realityCheck}
                                        </p>
                                    </div>

                                    {/* The question */}
                                    <div className="flex flex-col pt-2">
                                        <p className="font-serif text-3xl italic text-zinc-600 leading-snug -mt-6">
                                            {parsedContent.theQuestion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Fallback for old text-format records */
                            <p className="text-base text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                {insight.content}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { ProgressDetail };
