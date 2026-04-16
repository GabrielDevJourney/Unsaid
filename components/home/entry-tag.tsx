import {
    INSIGHT_TAG_STYLES,
    type InsightTagType,
} from "@/lib/constants/insight-tag-types";
import { cn } from "@/lib/utils";

type TagName = InsightTagType;

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
                active ? INSIGHT_TAG_STYLES[name] : INACTIVE_STYLE,
                className,
            )}
        >
            {name}
        </span>
    );
};

const ALL_TAG_NAMES = Object.keys(INSIGHT_TAG_STYLES) as TagName[];

export { EntryTag, ALL_TAG_NAMES, type TagName };
