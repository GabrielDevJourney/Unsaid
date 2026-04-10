"use client";

import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDate } from "@/lib/date-utils";
import type { EntryReflectionPreview } from "@/types";

interface SourceReflectionsProps {
    items: EntryReflectionPreview[];
    from: string;
}

const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!e.animationName.includes("accordion-down")) return;
    e.currentTarget.style.scrollMarginBottom = "6px";
    e.currentTarget.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
    });
};

const SourceReflections = ({ items, from }: SourceReflectionsProps) => {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 pt-4">
            <p className="font-semibold text-neutral-500">Your reflections</p>
            <Accordion type="multiple" className="flex flex-col gap-1">
                {items.map((item) => (
                    <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="rounded-lg border border-zinc-200 bg-white px-4"
                    >
                        <AccordionTrigger className="flex cursor-pointer items-center justify-between px-2 py-2.5 hover:no-underline [&>svg]:hidden">
                            <span className="font-serif italic text-sm text-zinc-600">
                                {formatDate(item.createdAt, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }).toLowerCase()}
                            </span>
                            <span className="text-xs text-zinc-400">
                                {item.wordCount} words
                            </span>
                        </AccordionTrigger>
                        <AccordionContent
                            onAnimationEnd={handleAnimationEnd}
                            className="flex flex-col gap-2 p-2"
                        >
                            {item.insightContent && (
                                <p className="font-sans text-base leading-relaxed text-zinc-500">
                                    {item.insightContent}
                                </p>
                            )}
                            <Link
                                href={`/entries/${item.id}?from=${encodeURIComponent(from)}`}
                                className="self-end text-xs text-zinc-500 transition-colors hover:text-zinc-900"
                            >
                                Read more
                            </Link>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export { SourceReflections };
