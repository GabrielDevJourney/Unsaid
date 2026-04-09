"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/date-utils";
import type { EntryReflectionPreview } from "@/types";

const DEFAULT_VISIBLE = 3;

interface SourceReflectionsProps {
    items: EntryReflectionPreview[];
    from: string;
}

const SourceReflections = ({ items, from }: SourceReflectionsProps) => {
    const [showAll, setShowAll] = useState(false);

    if (items.length === 0) return null;

    const visible = showAll ? items : items.slice(0, DEFAULT_VISIBLE);
    const overflow = items.length - DEFAULT_VISIBLE;

    return (
        <div className="flex flex-col gap-3 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Your reflections
            </p>
            <div className="flex flex-col gap-2">
                {visible.map((item) => (
                    <Link
                        key={item.id}
                        href={`/entries/${item.id}?from=${encodeURIComponent(from)}`}
                        className="flex items-baseline gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-colors hover:bg-zinc-50"
                    >
                        <span className="shrink-0 text-xs text-zinc-400">
                            {formatDate(item.createdAt, {
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        <span className="truncate text-sm text-zinc-600">
                            {item.contentPreview}
                        </span>
                    </Link>
                ))}
            </div>
            {!showAll && overflow > 0 && (
                <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="self-start text-xs text-zinc-400 transition-colors hover:text-zinc-600"
                >
                    +{overflow} more
                </button>
            )}
        </div>
    );
};

export { SourceReflections };
