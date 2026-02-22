"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export const JournalingSuggestion = () => {
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
                <AccordionContent className="px-5 pt-2">
                    <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                        What&apos;s been on your mind lately that you
                        haven&apos;t said out loud?
                    </p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
