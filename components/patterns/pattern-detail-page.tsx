import { PATTERN_TYPES } from "@/lib/constants/pattern-types";
import type { WeeklyInsightPattern } from "@/types";
import { PageHeader } from "../layout/page-header";
import { TYPE_BADGE_STYLES } from "./pattern-badge-styles";
import { ReferenceTimeline } from "./reference-timeline";

interface PatternDetailPageProps {
    pattern: WeeklyInsightPattern;
}

const PatternDetailPage = ({ pattern }: PatternDetailPageProps) => {
    const badgeStyle =
        TYPE_BADGE_STYLES[pattern.patternType] ??
        "border-zinc-300 bg-zinc-100 text-zinc-600";
    const typeLabel =
        PATTERN_TYPES[pattern.patternType]?.label ?? pattern.patternType;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/patterns">
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="font-serif text-4xl italic text-zinc-800">
                        Pattern
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Discover patterns from your journal entries, updated{" "}
                        <strong className="font-medium text-zinc-600">
                            weekly
                        </strong>
                        .
                    </p>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="flex gap-16 px-10 py-10">
                    {/* Left: sticky reference panel — shows all evidence */}
                    <div className="shrink-0 self-start sticky top-10">
                        <div className="rounded-xl border border-border overflow-hidden">
                            <ReferenceTimeline
                                items={pattern.evidence}
                                from={`/patterns/${pattern.id}`}
                                showAll
                            />
                        </div>
                    </div>

                    {/* Right: pattern content */}
                    <div className="flex flex-col gap-8 flex-1 min-w-0 max-w-2/3">
                        {/* Type badge */}
                        <span
                            className={`inline-flex h-7 items-center rounded-sm border px-2 text-xs font-medium self-start ${badgeStyle}`}
                        >
                            {typeLabel}
                        </span>

                        {/* Title */}
                        <h2 className="font-serif text-5xl italic text-zinc-800 leading-tight">
                            {pattern.title}
                        </h2>

                        {/* Description — the mirror */}
                        <p className="text-base text-zinc-600 leading-relaxed">
                            {pattern.description}
                        </p>

                        {/* Suggested experiment (optional) */}
                        {pattern.suggestedExperiment && (
                            <div className="flex flex-col gap-2 pt-8">
                                <p className="font-sans font-bold text-neutral-500">
                                    Small experiment{" "}
                                </p>
                                <p className=" text-zinc-600 leading-relaxed">
                                    {pattern.suggestedExperiment}
                                </p>
                            </div>
                        )}
                        {/* Reflect question (optional) */}
                        {pattern.question && (
                            <div className="flex flex-col gap-2 pt-8">
                                <p className="font-sans font-bold text-neutral-500">
                                    Reflection Question{" "}
                                </p>
                                <p className="font-serif italic text-neutral-500 text-3xl leading-relaxed underline">
                                    {pattern.question}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { PatternDetailPage, type PatternDetailPageProps };
