"use client";

import { Activity01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProgressCard } from "@/components/progress/progress-card";
import { Button } from "@/components/ui/button";
import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";
import type { OnboardingPreviewProgress } from "@/lib/schemas/onboarding-preview";
import type { ProgressInsight, ProgressInsightStructured } from "@/types";

interface ProgressStepProps {
    previewProgress?: OnboardingPreviewProgress;
    hasEntry: boolean;
    onContinue: () => void;
}

const toProgressInsight = (
    id: string,
    parsed: ProgressInsightStructured,
): ProgressInsight => ({
    id,
    userId: "",
    content: "",
    parsedContent: parsed,
    isViewed: true,
    recentEntryIds: [],
    relatedPastEntryIds: null,
    keyEntryIds: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const ProgressStep = ({
    previewProgress,
    hasEntry,
    onContinue,
}: ProgressStepProps) => {
    const entriesIn = hasEntry ? 1 : 0;
    const nextIn = PROGRESS_TRIGGER_INTERVAL - entriesIn;
    const fillPct = (entriesIn / PROGRESS_TRIGGER_INTERVAL) * 100;

    const insight: ProgressInsight | null = previewProgress
        ? toProgressInsight("preview-progress", {
              headline: previewProgress.headline,
              whatsOnRepeat: previewProgress.whatsOnRepeat,
              whatChanged: "",
              realityCheck: "",
              experiment: previewProgress.experiment,
              theQuestion: "",
              keyEntryNumbers: [],
          })
        : null;

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
                <h1 className="font-serif text-5xl italic text-neutral-500 mb-3">
                    Progress
                </h1>
                <p className="text-zinc-500 max-w-lg">
                    <span className="font-semibold">Every 15 entries</span>,
                    Unsaid creates a deep reflection, a comprehensive look at
                    your emotional landscape, growth, and the patterns shaping
                    your life.
                </p>
            </div>

            <div className="relative rounded-2xl border border-neutral-400 py-10 px-12">
                {/* Category icon chip */}
                <div className="absolute -top-6 -left-4 bg-white border rounded-md p-1.5">
                    <HugeiconsIcon
                        icon={Activity01Icon}
                        strokeWidth={1}
                        className="size-9 text-zinc-500"
                    />
                </div>

                <div className="flex flex-col gap-12 mt-2">
                    {/* Progress bar — centered, 50% width */}
                    <div className="flex justify-center">
                        <div className="w-1/2 flex flex-col gap-2">
                            <div className="relative h-2 rounded-full bg-neutral-300 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-slate-400 overflow-hidden"
                                    style={{ width: `${fillPct}%` }}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.75)_5%,rgba(255,115,1,0.45)_20%,transparent_55%)]" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Next synthesis in{" "}
                                <span className="font-medium text-zinc-600">
                                    {nextIn}{" "}
                                    {nextIn === 1 ? "entry" : "entries"}
                                </span>
                            </p>
                        </div>
                    </div>

                    {insight ? (
                        <ProgressCard insight={insight} />
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <p className="text-zinc-500">
                                Your first progress synthesis appears after 15
                                entries.
                            </p>
                        </div>
                    )}

                    <p className=" text-zinc-500 text-center">
                        The more you write, the deeper we see.
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="sunrise" size="sm" onClick={onContinue}>
                    <span>Continue</span>
                </Button>
            </div>
        </div>
    );
};

export { ProgressStep };
