"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalingSuggestionProps {
    suggestion: string | null;
    isLoading: boolean;
    isNewEntry: boolean;
    hasContent: boolean;
    onDismiss: () => void;
}

export const JournalingSuggestion = ({
    suggestion,
    isLoading,
    isNewEntry,
    hasContent,
    onDismiss,
}: JournalingSuggestionProps) => {
    const [isUsed, setIsUsed] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    if (hasContent && !isUsed) return null;

    if (isLoading) {
        return (
            <div className="space-y-2 px-12 pt-8 pb-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }

    if (!suggestion) return null;

    const showButtons = isNewEntry && !hasContent && !isUsed;

    return (
        <div className="px-12 pt-8 pb-4">
            <p
                className={`font-serif italic text-lg leading-relaxed transition-colors ${isUsed ? "text-neutral-500" : "text-neutral-300"}`}
            >
                {suggestion}
            </p>
            {showButtons && (
                <div className="mt-3 flex gap-2">
                    <Button
                        variant="sunrise"
                        size="sm"
                        onClick={() => setIsUsed(true)}
                    >
                        Use this prompt
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsDismissed(true);
                            onDismiss();
                        }}
                    >
                        Dismiss
                    </Button>
                </div>
            )}
        </div>
    );
};
