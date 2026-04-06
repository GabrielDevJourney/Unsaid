import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { cn } from "@/lib/utils";

type TagName = InsightTagType;

// Thematic pastel system — bg/border/text in custom hex
// Pattern: very light bg, mid-tone border, dark readable text
const TAG_STYLES: Record<TagName, string> = {
    Relationships: "border-[#f5c6d8] bg-[#fdf0f5] text-[#a03060]", // warm rose — intimacy
    Work: "border-[#c2d0f0] bg-[#f0f4fd] text-[#2d4a8f]", // cool slate-blue — professional
    Family: "border-[#f5d5b2] bg-[#fdf4ed] text-[#8f4a20]", // warm peach — nurturing
    Health: "border-[#b8e8c5] bg-[#f0faf3] text-[#2a7048]", // fresh green — vitality
    Identity: "border-[#d8c8f5] bg-[#f5f0fd] text-[#6030a0]", // lavender — introspection
    Goals: "border-[#b8d8f0] bg-[#f0f7fd] text-[#2060a0]", // sky blue — aspiration
    Anxiety: "border-[#f0e2a0] bg-[#fdf9e8] text-[#7a6010]", // warm yellow — tension
    Boundaries: "border-[#c8c8f5] bg-[#f0f0fd] text-[#3030a0]", // indigo — firm lines
    "Self-Worth": "border-[#d0f0b8] bg-[#f5fdf0] text-[#506020]", // lime — value, freshness
    Money: "border-[#b0e8d5] bg-[#f0fdf8] text-[#206050]", // emerald — exchange, growth
    Habits: "border-[#a8e8e0] bg-[#f0fdfb] text-[#186058]", // teal — rhythm, consistency
    Creativity: "border-[#a8e8f5] bg-[#f0fdff] text-[#186078]", // cyan — imagination, flow
    Loss: "border-[#ccd0dc] bg-[#f4f5f8] text-[#404860]", // muted slate — grief, absence
    Growth: "border-[#f0c888] bg-[#fdf6e8] text-[#804010]", // amber-gold — expansion, forward motion
    Conflict: "border-[#f5c0a8] bg-[#fdf3f0] text-[#8f3020]", // terracotta — clash, tension
    Purpose: "border-[#d0c0f5] bg-[#f3f0fd] text-[#5830a8]", // violet — meaning, depth
    Loneliness: "border-[#c0d4dc] bg-[#f2f6f8] text-[#305060]", // cool blue-gray — isolation
    Stress: "border-[#f5c0c8] bg-[#fdf0f2] text-[#a02838]", // rose-red — pressure, strain
    Change: "border-[#f0dcc8] bg-[#fdf6f0] text-[#7a5030]", // amber-stone — transition
    Decision: "border-[#d0d4e0] bg-[#f3f4f8] text-[#3a4060]", // blue-gray — clarity, choice
    Vulnerability: "border-[#f0c8e8] bg-[#fdf0fb] text-[#8a3070]", // pink-mauve — openness
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
