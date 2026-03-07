import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { cn } from "@/lib/utils";

type TagName = InsightTagType;

// Pattern: bg-{color}-50, border-{color}-300, text-{color}-800
const TAG_STYLES: Record<TagName, string> = {
    Relationships: "border-red-300 bg-red-100 text-red-800",
    Work: "border-amber-300 bg-amber-100 text-amber-800",
    Family: "border-orange-300 bg-orange-100 text-orange-800",
    Health: "border-green-300 bg-green-100 text-green-800",
    Identity: "border-purple-300 bg-purple-100 text-purple-800",
    Goals: "border-blue-300 bg-blue-100 text-blue-800",
    Anxiety: "border-yellow-300 bg-yellow-100 text-yellow-800",
    Boundaries: "border-indigo-300 bg-indigo-100 text-indigo-800",
    "Self-Worth": "border-lime-300 bg-lime-100 text-lime-800",
    Money: "border-emerald-300 bg-emerald-100 text-emerald-800",
    Habits: "border-teal-300 bg-teal-100 text-teal-800",
    Creativity: "border-cyan-300 bg-cyan-100 text-cyan-800",
    Loss: "border-pink-300 bg-pink-100 text-pink-800",
    Growth: "border-sky-300 bg-sky-100 text-sky-800",
    Conflict: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800",
    Purpose: "border-violet-300 bg-violet-100 text-violet-800",
    Loneliness: "border-slate-300 bg-slate-100 text-slate-800",
    Stress: "border-rose-300 bg-rose-100 text-rose-800",
    Change: "border-stone-300 bg-stone-100 text-stone-800",
    Decision: "border-gray-300 bg-gray-100 text-gray-800",
};

const INACTIVE_STYLE = "border-zinc-300 bg-zinc-100 text-zinc-500";

interface EntryTagProps {
    name: TagName;
    active?: boolean;
    className?: string;
}

const EntryTag = ({ name, active = true, className }: EntryTagProps) => {
    return (
        <span
            className={cn(
                "inline-flex h-7 items-center rounded-sm border px-2 text-xs font-medium transition-colors",
                active ? TAG_STYLES[name] : INACTIVE_STYLE,
                className,
            )}
        >
            {name}
        </span>
    );
};

const ALL_TAG_NAMES = Object.keys(TAG_STYLES) as TagName[];

export { EntryTag, TAG_STYLES, ALL_TAG_NAMES, type TagName };
