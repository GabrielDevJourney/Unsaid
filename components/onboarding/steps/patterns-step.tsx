"use client";

import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PatternCard } from "@/components/patterns/pattern-card";
import { Button } from "@/components/ui/button";
import type { OnboardingPreviewPattern } from "@/lib/schemas/onboarding-preview";
import type { WeeklyInsightPattern } from "@/types";

interface PatternsStepProps {
    previewPattern?: OnboardingPreviewPattern;
    entryId?: string;
    onContinue: () => void;
}

const PatternsStep = ({
    previewPattern,
    entryId,
    onContinue,
}: PatternsStepProps) => {
    const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
    });

    const pattern: WeeklyInsightPattern | null = previewPattern
        ? {
              id: "preview-pattern",
              weeklyInsightId: "preview",
              title: previewPattern.title,
              patternType: previewPattern.type,
              description: previewPattern.description,
              evidence: entryId ? [{ entryId, label: today }] : [],
              question: previewPattern.question,
              suggestedExperiment: null,
              createdAt: new Date().toISOString(),
              isViewed: true,
          }
        : null;

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            <div className="text-center">
                <h1 className="font-serif text-5xl italic text-neutral-500 mb-3">
                    Patterns
                </h1>
                <p className="text-zinc-500 max-w-lg mx-auto">
                    Every week, Unsaid finds the threads connecting your
                    writing: recurring emotions, triggers, blind spots you
                    didn&apos;t notice.
                </p>
            </div>

            <div className="relative rounded-2xl border border-neutral-400 p-12">
                {/* Category icon chip */}
                <div className="absolute -top-6 -left-4 bg-white border border-border rounded-md p-1.5">
                    <HugeiconsIcon
                        icon={DashboardSquare01Icon}
                        strokeWidth={1}
                        className="size-8 text-zinc-500"
                    />
                </div>

                <div className="flex flex-col gap-6 mt-2">
                    {pattern ? (
                        <PatternCard pattern={pattern} from="/onboarding" />
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <p className="text-zinc-500">
                                Your first pattern will appear after your first
                                week of writing.
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-zinc-500 text-center mt-8">
                    New patterns surface{" "}
                    <span className="font-semibold">every week</span> as you
                    write.
                </p>
            </div>

            <div className="flex justify-end">
                <Button variant="sunrise" size="sm" onClick={onContinue}>
                    <span>Continue</span>
                </Button>
            </div>
        </div>
    );
};

export { PatternsStep };
