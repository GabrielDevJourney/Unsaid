import { Separator } from "@/components/ui/separator";
import type { WeeklyInsightPattern } from "@/types";

interface PatternCardContentProps {
    pattern: WeeklyInsightPattern;
}

const PatternCardContent = ({ pattern }: PatternCardContentProps) => (
    <div className="flex flex-col gap-4 px-5 pb-5">
        <Separator />

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
            {pattern.description}
        </p>

        {/* Evidence */}
        {pattern.evidence.length > 0 && (
            <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Evidence
                </p>
                <ul className="flex flex-col gap-1">
                    {pattern.evidence.map((item) => (
                        <li
                            key={item.entryId}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-400" />
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Reflective question */}
        {pattern.question && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-1">
                    Reflect
                </p>
                <p className="text-sm italic text-zinc-600">
                    {pattern.question}
                </p>
            </div>
        )}

        {/* Suggested experiment */}
        {pattern.suggestedExperiment && (
            <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Try this
                </p>
                <p className="text-sm text-muted-foreground">
                    {pattern.suggestedExperiment}
                </p>
            </div>
        )}
    </div>
);

export { PatternCardContent, type PatternCardContentProps };
