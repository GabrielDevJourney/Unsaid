"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createEntryAction } from "@/app/actions/entries";
import { EntryEditor } from "@/components/entries/entry-editor";
import type { InsightDisplayHandle } from "@/components/entries/insight-display";
import { InsightDisplay } from "@/components/entries/insight-display";
import { EntryTag } from "@/components/home/entry-tag";
import { Button } from "@/components/ui/button";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { insightSchema } from "@/lib/schemas/entry-insight";
import {
    type OnboardingPreview,
    onboardingPreviewSchema,
} from "@/lib/schemas/onboarding-preview";
import { cn } from "@/lib/utils";

const ONBOARDING_MIN_CHARS = 50;

const REVEAL_PHRASES = [
    "Reading between the lines...",
    "Finding the threads...",
    "Listening closely...",
] as const;

type Phase = "writing" | "loading" | "revealed";

interface ReflectionStepProps {
    onContinue: (data: {
        entryId: string;
        entryContent: string;
        insightText: string;
        tags: InsightTagType[];
        preview?: OnboardingPreview;
    }) => void;
    onSkip: () => void;
    onEntryReady?: (data: {
        entryId: string;
        entryContent: string;
        insightText: string;
        tags: InsightTagType[];
    }) => void;
    onPreviewReady?: (preview: OnboardingPreview) => void;
    initialEntryId?: string;
    initialContent?: string;
    initialInsight?: { text: string; tags: InsightTagType[] };
    initialPreview?: OnboardingPreview;
}

const ReflectionStep = ({
    onContinue,
    onSkip,
    onEntryReady,
    onPreviewReady,
    initialEntryId,
    initialContent,
    initialInsight,
    initialPreview,
}: ReflectionStepProps) => {
    const isRestoring = !!initialEntryId && !!initialInsight;

    const [phase, setPhase] = useState<Phase>(
        isRestoring ? "revealed" : "writing",
    );
    const [content, setContent] = useState(initialContent ?? "");
    const [entryId, setEntryId] = useState<string | null>(
        initialEntryId ?? null,
    );
    const [savedInsight, setSavedInsight] = useState<{
        text: string;
        tags: InsightTagType[];
    } | null>(initialInsight ?? null);
    const [previewData, setPreviewData] = useState<OnboardingPreview | null>(
        initialPreview ?? null,
    );
    const [previewLoading, setPreviewLoading] = useState(false);
    const [isGoingDeeper, setIsGoingDeeper] = useState(false);

    // Loading animation state
    const [revealPhrase, setRevealPhrase] = useState(0);
    const [phraseVisible, setPhraseVisible] = useState(true);

    // Refs for values used inside onFinish to avoid stale closures
    const insightCountRef = useRef(isRestoring ? 1 : 0);
    const entryIdRef = useRef<string | null>(initialEntryId ?? null);
    const contentRef = useRef(initialContent ?? "");
    const insightDisplayRef = useRef<InsightDisplayHandle>(null);

    const loadExistingEntry = useEntryEditorStore((s) => s.loadExistingEntry);
    const storeInsight = useEntryEditorStore((s) => s.insight);
    const currentTags = (storeInsight?.tags ?? []) as InsightTagType[];
    const canGoDeeper =
        !!storeInsight && storeInsight.insightCount < MAX_INSIGHT_COUNT;

    // Restore entry editor store when navigating back to an already-completed step
    useEffect(() => {
        if (
            !isRestoring ||
            !initialEntryId ||
            !initialContent ||
            !initialInsight
        )
            return;
        loadExistingEntry(initialEntryId, initialContent, {
            id: "",
            content: initialInsight.text,
            tags: initialInsight.tags,
            insightCount: 1,
            createdAt: new Date().toISOString(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        initialContent,
        initialEntryId,
        initialInsight,
        isRestoring,
        loadExistingEntry,
    ]);

    useEffect(() => {
        if (phase !== "loading") return;
        let fadeTimeout: ReturnType<typeof setTimeout>;
        const interval = setInterval(() => {
            setPhraseVisible(false);
            fadeTimeout = setTimeout(() => {
                setRevealPhrase((i) => (i + 1) % REVEAL_PHRASES.length);
                setPhraseVisible(true);
            }, 350);
        }, 2200);
        return () => {
            clearInterval(interval);
            clearTimeout(fadeTimeout);
        };
    }, [phase]);

    const { submit } = useObject({
        api: "/api/entry-insights",
        schema: insightSchema,
        onFinish: ({ object: done }) => {
            if (!done) return;
            const newCount = insightCountRef.current + 1;
            insightCountRef.current = newCount;
            setSavedInsight({
                text: done.insight,
                tags: (done.tags ?? []) as InsightTagType[],
            });

            // Bootstrap the entry editor store so InsightDisplay works natively
            if (entryIdRef.current) {
                loadExistingEntry(entryIdRef.current, contentRef.current, {
                    id: "",
                    content: done.insight,
                    tags: done.tags ?? [],
                    insightCount: newCount,
                    createdAt: new Date().toISOString(),
                });
            }

            setPhase("revealed");

            // Notify wizard of entry+insight immediately so data survives navigation
            if (newCount === 1 && entryIdRef.current) {
                onEntryReady?.({
                    entryId: entryIdRef.current,
                    entryContent: contentRef.current,
                    insightText: done.insight,
                    tags: (done.tags ?? []) as InsightTagType[],
                });

                // Fire background preview call after first insight only
                setPreviewLoading(true);
                fetch("/api/onboarding-preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        entry_id: entryIdRef.current,
                        content: contentRef.current,
                        insight: done.insight,
                        tags: done.tags ?? [],
                    }),
                })
                    .then((r) => r.json())
                    .then(({ data }) => {
                        if (!data) return;
                        const parsed = onboardingPreviewSchema.safeParse(data);
                        if (parsed.success) {
                            setPreviewData(parsed.data);
                            onPreviewReady?.(parsed.data);
                        } else {
                            console.warn(
                                "Onboarding preview: invalid response shape",
                                parsed.error,
                            );
                        }
                    })
                    .catch((err) =>
                        console.warn("Onboarding preview fetch failed", err),
                    )
                    .finally(() => setPreviewLoading(false));
            }
        },
    });

    const handleReveal = useCallback(async () => {
        if (content.length < ONBOARDING_MIN_CHARS) return;
        setPhase("loading");
        contentRef.current = content;

        const result = await createEntryAction(content);
        if (result.error ?? !result.data) {
            setPhase("writing");
            return;
        }

        const id = result.data.id;
        setEntryId(id);
        entryIdRef.current = id;
        submit({ entry_id: id, content });
    }, [content, submit]);

    const handleContinue = useCallback(() => {
        if (!entryId || !savedInsight) return;
        onContinue({
            entryId,
            entryContent: content,
            insightText: savedInsight.text,
            tags: savedInsight.tags,
            preview: previewData ?? undefined,
        });
    }, [entryId, content, savedInsight, previewData, onContinue]);

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="w-full max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-5xl italic text-neutral-500 mb-2">
                    Your first reflection
                </h1>
                <p className="text-zinc-500">
                    Write freely, there&apos;s no wrong way to do this.
                </p>
            </div>

            {phase === "writing" && (
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="w-full rounded-xl bg-card shadow-sm overflow-hidden">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's been on your mind lately?"
                            className="w-full min-h-80 p-12 font-serif text-base text-neutral-500 leading-relaxed bg-transparent outline-none placeholder:text-muted-foreground/50 resize-none"
                            // biome-ignore lint/a11y/noAutofocus: intentional for writing flow
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onSkip}
                            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            Skip this step
                        </button>
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-700 p-2",
                                content.length >= ONBOARDING_MIN_CHARS
                                    ? "max-w-48 opacity-100 ml-4"
                                    : "max-w-0 opacity-0",
                            )}
                        >
                            <Button
                                variant="sunrise"
                                size="sm"
                                onClick={handleReveal}
                            >
                                Reveal my insights
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {phase === "loading" && (
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 py-20">
                    <div className="relative flex items-center justify-center size-32">
                        <div className="absolute size-8 rounded-full bg-slate-300/60 animate-pulse-wave-1" />
                        <div className="absolute size-8 rounded-full bg-slate-300/60 animate-pulse-wave-2" />
                        <div className="relative z-10 size-2.5 rounded-full bg-slate-400" />
                    </div>
                    <p
                        className={cn(
                            "text-sm italic text-zinc-400 transition-all duration-500",
                            phraseVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-1",
                        )}
                    >
                        {REVEAL_PHRASES[revealPhrase]}
                        <span className="ml-0.5 animate-pulse">...</span>
                    </p>
                </div>
            )}

            {phase === "revealed" && (
                <div className="flex gap-6 mx-auto items-start">
                    <div className="w-208 shrink-0 flex flex-col gap-4">
                        <div className="h-112">
                            <EntryEditor />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {currentTags.map((tag) => (
                                <EntryTag key={tag} name={tag} />
                            ))}
                        </div>
                    </div>
                    <div className="w-108 shrink-0 flex flex-col gap-4">
                        <div className="h-112">
                            <InsightDisplay
                                ref={insightDisplayRef}
                                entryId={entryId}
                                hideNewInsight
                                onGenerating={setIsGoingDeeper}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            {canGoDeeper && (
                                <Button
                                    variant="sunrise"
                                    size="sm"
                                    onClick={() =>
                                        insightDisplayRef.current?.generate()
                                    }
                                    disabled={isGoingDeeper || previewLoading}
                                >
                                    {isGoingDeeper
                                        ? "Going deeper..."
                                        : "Go deeper"}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleContinue}
                                disabled={previewLoading || isGoingDeeper}
                                className="bg-neutral-300 font-light rounded-xl"
                            >
                                {previewLoading ? "One moment..." : "Continue"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ReflectionStep };
