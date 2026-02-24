"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalingSuggestionProps {
    suggestion: string | null;
    isLoading: boolean;
}

export const JournalingSuggestion = ({
    suggestion,
    isLoading,
}: JournalingSuggestionProps) => {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem
                value="suggestion"
                className="rounded-lg border border-neutral-300 bg-neutral-200"
            >
                <AccordionTrigger
                    iconSide="left"
                    className="px-4 py-3 data-[state=open]:border-b data-[state=open]:rounded-none border-neutral-300 text-neutral-500 font-sans"
                >
                    Need a journaling suggestion?
                </AccordionTrigger>
                <AccordionContent className="px-5 pt-2 pb-3">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-3/4" />
                        </div>
                    ) : suggestion ? (
                        <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                            {suggestion}
                        </p>
                    ) : (
                        <p className="text-sm font-sans italic text-muted-foreground/60">
                            No journaling suggestion was used for this entry.
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
