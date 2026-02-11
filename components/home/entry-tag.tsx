import { cn } from "@/lib/utils";

type TagName =
    | "Relationships"
    | "Work"
    | "Family"
    | "Health"
    | "Identity"
    | "Goals"
    | "Anxiety"
    | "Boundaries"
    | "Self-Worth"
    | "Money"
    | "Habits"
    | "Creativity"
    | "Loss"
    | "Growth"
    | "Conflict"
    | "Purpose"
    | "Loneliness"
    | "Stress"
    | "Change"
    | "Decision";

// Each tag: border-{color}-400, bg-{color}-50, text-{color}-800
const TAG_STYLES: Record<TagName, string> = {
    Relationships: "border-red-400 bg-red-50 text-red-800",
    Work: "border-amber-400 bg-amber-50 text-amber-800",
    Family: "border-orange-400 bg-orange-50 text-orange-800",
    Health: "border-green-400 bg-green-50 text-green-800",
    Identity: "border-purple-400 bg-purple-50 text-purple-800",
    Goals: "border-blue-400 bg-blue-50 text-blue-800",
    Anxiety: "border-yellow-400 bg-yellow-50 text-yellow-800",
    Boundaries: "border-indigo-400 bg-indigo-50 text-indigo-800",
    "Self-Worth": "border-lime-400 bg-lime-50 text-lime-800",
    Money: "border-emerald-400 bg-emerald-50 text-emerald-800",
    Habits: "border-teal-400 bg-teal-50 text-teal-800",
    Creativity: "border-cyan-400 bg-cyan-50 text-cyan-800",
    Loss: "border-pink-400 bg-pink-50 text-pink-800",
    Growth: "border-sky-400 bg-sky-50 text-sky-800",
    Conflict: "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-800",
    Purpose: "border-violet-400 bg-violet-50 text-violet-800",
    Loneliness: "border-slate-400 bg-slate-50 text-slate-800",
    Stress: "border-rose-400 bg-rose-50 text-rose-800",
    Change: "border-stone-400 bg-stone-50 text-stone-800",
    Decision: "border-pink-400 bg-pink-50 text-pink-800",
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
