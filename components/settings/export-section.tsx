"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ExportState = "idle" | "loading" | "done" | "partial" | "error";

const ExportSection = () => {
    const [state, setState] = useState<ExportState>("idle");
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        };
    }, []);

    const handleExport = async () => {
        setState("loading");

        try {
            const res = await fetch("/api/export");

            if (!res.ok) {
                setState("error");
                return;
            }

            const warnings = res.headers.get("X-Export-Warnings");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            const today = new Date().toISOString().split("T")[0];
            const a = document.createElement("a");
            a.href = url;
            a.download = `unsaid-journal-${today}.md`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            setState(warnings ? "partial" : "done");
            resetTimerRef.current = setTimeout(() => setState("idle"), 4000);
        } catch {
            setState("error");
        }
    };

    const label = {
        idle: "Download",
        loading: "Preparing your file...",
        done: "Downloaded",
        partial: "Downloaded with warnings",
        error: "Download",
    }[state];

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="pl-2 text-2xl font-medium font-serif italic text-neutral-500">
                    Export data
                </h2>
                <Separator />
            </div>

            <div className="flex flex-col gap-2 pl-2">
                <p className="text-sm text-muted-foreground">
                    Your entries, insights, weekly patterns and progress
                    insights, all in one Markdown file. Open it in Obsidian,
                    Notion, or any text editor.
                </p>

                <div className="flex items-center gap-3 mt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={state === "loading"}
                        className="shadow-xs cursor-pointer"
                    >
                        {state !== "loading" && (
                            <HugeiconsIcon
                                icon={Download01Icon}
                                className="size-4"
                            />
                        )}
                        {state === "loading" && (
                            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                        {label}
                    </Button>
                </div>

                {state === "error" && (
                    <p className="text-xs text-destructive">
                        Export failed. Try again.
                    </p>
                )}

                {state === "partial" && (
                    <p className="text-xs text-amber-600">
                        Downloaded with warnings — check the file header for
                        details.
                    </p>
                )}
            </div>
        </section>
    );
};

export { ExportSection };
