"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { insightSchema } from "@/lib/schemas/entry-insight";

interface InsightDisplayProps {
    entryId: string | null;
}

export const InsightDisplay = ({ entryId }: InsightDisplayProps) => {
    const router = useRouter();
    const { insight, content, setInsight } = useEntryEditorStore();

    const hasContent = content.trim().length > 0;
    const hasInsight = !!insight;
    const isAtLimit = hasInsight && insight.insightCount >= MAX_INSIGHT_COUNT;

    const { object, submit, isLoading } = useObject({
        api: "/api/entry-insights",
        schema: insightSchema,
        onFinish: ({ object: done }) => {
            if (!done) return;
            const prev = useEntryEditorStore.getState().insight;
            setInsight({
                id: prev?.id ?? "",
                content: done.insight,
                tags: done.tags ?? [],
                insightCount: (prev?.insightCount ?? 0) + 1,
                createdAt: prev?.createdAt ?? new Date().toISOString(),
            });
            router.refresh();
        },
    });

    const handleNewInsight = useCallback(() => {
        if (!entryId || isLoading || isAtLimit || !hasContent) return;
        submit({ entry_id: entryId, content });
    }, [entryId, content, hasContent, isLoading, isAtLimit, submit]);

    // State 1: no content yet or no entry saved → empty state
    if (!hasContent || !entryId) {
        return (
            <div className="rounded-lg border p-6 min-h-28">
                <p className="text-sm text-muted-foreground font-sans">
                    Start writing, your insights will show up here...
                </p>
            </div>
        );
    }

    // State 2: entry saved, no insight, not generating → prompt state
    if (!hasInsight && !isLoading) {
        return (
            <div className="rounded-xl border p-6 font-sans flex flex-col items-center justify-center gap-6 text-center min-h-52">
                <p className="text-sm text-muted-foreground">
                    Ready to reflect on what you just wrote? (1/3)
                </p>
                <Button variant="sunrise" size="sm" onClick={handleNewInsight}>
                    <span>New insight</span>
                </Button>
            </div>
        );
    }

    // State 3: generating OR has a saved insight
    // object.insight is a DeepPartial string — it updates token by token
    const displayContent = isLoading
        ? (object?.insight ?? "")
        : (insight?.content ?? "");
    const displayCount = isLoading
        ? (insight?.insightCount ?? 0) + 1
        : (insight?.insightCount ?? 1);

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-xl border flex flex-col">
                <div className="flex gap-2 items-center border-b py-6 px-4">
                    <span className="font-serif text-2xl italic text-zinc-600">
                        Insight
                    </span>
                    <div className="bg-neutral-200 rounded-xl w-9 h-5 flex items-center justify-center">
                        <span className="text-xs text-neutral-500">
                            {displayCount}/{MAX_INSIGHT_COUNT}
                        </span>
                    </div>
                </div>

                <p className="text-base text-neutral-600 leading-6 p-4 font-sans">
                    {displayContent}
                </p>
            </div>

            {!isAtLimit && (
                <Button
                    variant="sunrise"
                    size="sm"
                    onClick={handleNewInsight}
                    disabled={isLoading}
                    className="self-start"
                >
                    <span>{isLoading ? "Generating..." : "New insight"}</span>
                </Button>
            )}
        </div>
    );
};
