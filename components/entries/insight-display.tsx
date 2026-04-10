"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Image from "next/image";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { insightSchema } from "@/lib/schemas/entry-insight";

export interface InsightDisplayHandle {
    generate: () => void;
}

interface InsightDisplayProps {
    entryId: string | null;
    onInsightComplete?: (
        content: string,
        tags: string[],
        count: number,
    ) => void;
}

// Pure presentational blockquote — used both for completed segments and streaming
export const InsightBlockquote = ({ content }: { content: string }) => (
    <div className="mx-12 mb-6">
        <Image
            src="/logo-entry-editor-pen.svg"
            alt=""
            aria-hidden="true"
            width={12}
            height={12}
            className="mb-2"
        />
        <blockquote className="border-l-2 border-[#79A1B9] pl-4">
            <p className="font-serif text-base leading-relaxed text-[#79A1B9]">
                {content}
            </p>
        </blockquote>
    </div>
);

const InsightDisplay = forwardRef<InsightDisplayHandle, InsightDisplayProps>(
    ({ entryId, onInsightComplete }, ref) => {
        const { insights, content, addInsight, setIsGeneratingInsight } =
            useEntryEditorStore();

        const hasContent = content.trim().length > 0;
        const isAtLimit = insights.length >= MAX_INSIGHT_COUNT;

        const isCompleteRef = useRef(false);

        const { object, submit, isLoading } = useObject({
            api: "/api/entry-insights",
            schema: insightSchema,
            onFinish: ({ object: done }) => {
                if (!done) return;
                const newOrder =
                    useEntryEditorStore.getState().insights.length + 1;
                addInsight({
                    id: "",
                    content: done.insight,
                    tags: done.tags ?? [],
                    insightCount: newOrder,
                    generationOrder: newOrder,
                    contentBeforeLength: null,
                    createdAt: new Date().toISOString(),
                });

                if (onInsightComplete) {
                    isCompleteRef.current = true;
                    onInsightComplete(done.insight, done.tags ?? [], newOrder);
                }
            },
        });

        useEffect(() => {
            setIsGeneratingInsight(isLoading);
        }, [isLoading, setIsGeneratingInsight]);

        const handleGenerate = useCallback(() => {
            if (!entryId || isLoading || isAtLimit || !hasContent) return;
            isCompleteRef.current = false;
            const reflectionContext =
                useEntryEditorStore.getState().reflectionContext;
            submit({
                entry_id: entryId,
                ...(reflectionContext && {
                    reflection_context: reflectionContext,
                }),
            });
        }, [entryId, hasContent, isLoading, isAtLimit, submit]);

        useImperativeHandle(ref, () => ({ generate: handleGenerate }));

        // When caller manages segment display, only render during active streaming
        if (onInsightComplete && !isLoading) return null;

        if (insights.length === 0 && !isLoading) return null;

        const displayContent = isLoading
            ? (object?.insight ?? "")
            : (insights.at(-1)?.content ?? "");

        return <InsightBlockquote content={displayContent} />;
    },
);

InsightDisplay.displayName = "InsightDisplay";

export { InsightDisplay };
