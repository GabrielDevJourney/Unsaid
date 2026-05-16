"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ReferenceTimeline } from "@/components/shared/reference-timeline";
import { SourceReflections } from "@/components/shared/source-reflections";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import type { EntryReflectionPreview, ProgressInsight } from "@/types";

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
    reflections: EntryReflectionPreview[];
}

const ProgressDetail = ({
    insight,
    keyEntryData,
    reflections,
}: ProgressDetailProps) => {
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
                    <h1 className="font-serif text-2xl md:text-4xl italic text-zinc-800">
                        Reflection
                    </h1>
                    <p className="text-sm text-muted-foreground">{date}</p>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto lg:overflow-hidden">
                <div className="flex flex-col gap-6 px-6 py-8 bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px] lg:flex-row lg:h-full lg:gap-12 lg:pl-12 lg:pr-0 lg:pt-0 lg:pb-0">
                    {/* Left: reference panel — stays in place while content scrolls */}
                    {referenceItems.length > 0 && (
                        <div className="shrink-0 lg:py-10">
                            <div className="w-fit rounded-xl border border-border overflow-hidden shadow-md">
                                <ReferenceTimeline
                                    items={referenceItems}
                                    from={`/progress/${insight.id}`}
                                    showAll
                                />
                            </div>
                        </div>
                    )}

                    {/* Right: card itself scrolls */}
                    <div className="flex flex-col min-w-0 lg:flex-1 lg:pt-10 lg:pr-10 lg:pb-10">
                        {parsedContent ? (
                            <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-border lg:h-full">
                                <div className="flex flex-col gap-10 overflow-y-auto bg-zinc-50 p-8 [&::-webkit-scrollbar]:w-0 lg:h-full">
                                    {/* Headline */}
                                    <h2 className="font-serif text-3xl lg:text-4xl italic text-neutral-500 leading-relaxed">
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
                                    <div className="flex flex-col pt-2 gap-4">
                                        <p className="font-serif text-3xl italic text-zinc-600 leading-snug -mt-6">
                                            "{parsedContent.theQuestion}
                                        </p>
                                        <div className="flex justify-start">
                                            <Button
                                                asChild
                                                variant="sunrise"
                                                size="sm"
                                                className="bg-[radial-gradient(circle_at_75%_230%,rgba(247,107,21,0.8)_0%,rgba(255,115,1,0.5)_30%,transparent_60%)]"
                                            >
                                                <Link
                                                    href={`/entries/new?suggestion=${encodeURIComponent(parsedContent.theQuestion)}&sourceType=progress&sourceId=${insight.id}&from=/progress/${insight.id}`}
                                                >
                                                    <HugeiconsIcon
                                                        icon={Add01Icon}
                                                        className="size-4 text-white"
                                                    />
                                                    Reflect about this
                                                </Link>
                                            </Button>
                                        </div>
                                        <SourceReflections
                                            items={reflections}
                                            from={`/progress/${insight.id}`}
                                        />
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
