"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Image from "next/image";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
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
        <blockquote
            className="border-l-2 pl-4"
            style={{ borderColor: "#79A1B9" }}
        >
            <p
                className="font-serif text-base leading-relaxed"
                style={{ color: "#79A1B9" }}
            >
                {content}
            </p>
        </blockquote>
    </div>
);

const InsightDisplay = forwardRef<InsightDisplayHandle, InsightDisplayProps>(
    ({ entryId, onInsightComplete }, ref) => {
        const { insight, content, setInsight, setIsGeneratingInsight } =
            useEntryEditorStore();

        const hasContent = content.trim().length > 0;
        const hasInsight = !!insight;
        const isAtLimit =
            hasInsight && insight.insightCount >= MAX_INSIGHT_COUNT;

        const [_isComplete, setIsComplete] = useState(false);

        const { object, submit, isLoading } = useObject({
            api: "/api/entry-insights",
            schema: insightSchema,
            onFinish: ({ object: done }) => {
                if (!done) return;
                const prev = useEntryEditorStore.getState().insight;
                const newCount = (prev?.insightCount ?? 0) + 1;
                setInsight({
                    id: prev?.id ?? "",
                    content: done.insight,
                    tags: done.tags ?? [],
                    insightCount: newCount,
                    createdAt: prev?.createdAt ?? new Date().toISOString(),
                });

                if (onInsightComplete) {
                    setIsComplete(true);
                    onInsightComplete(done.insight, done.tags ?? [], newCount);
                }
            },
        });

        useEffect(() => {
            setIsGeneratingInsight(isLoading);
        }, [isLoading, setIsGeneratingInsight]);

        const handleGenerate = useCallback(() => {
            if (!entryId || isLoading || isAtLimit || !hasContent) return;
            setIsComplete(false);
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

        if (!hasInsight && !isLoading) return null;

        const displayContent = isLoading
            ? (object?.insight ?? "")
            : (insight?.content ?? "");

        return <InsightBlockquote content={displayContent} />;
    },
);

InsightDisplay.displayName = "InsightDisplay";

export { InsightDisplay };
