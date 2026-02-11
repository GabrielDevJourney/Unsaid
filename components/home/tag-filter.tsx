import { Flag03Icon } from "@hugeicons/core-free-icons";

import {
    ALL_TAG_NAMES,
    EntryTag,
    type TagName,
} from "@/components/home/entry-tag";
import { FilterButton } from "@/components/home/filter-button";

interface TagFilterProps {
    selectedTags: Set<TagName>;
    onToggleTag: (tag: TagName) => void;
    onClearTags: () => void;
}

const TagFilter = ({
    selectedTags,
    onToggleTag,
    onClearTags,
}: TagFilterProps) => (
    <FilterButton
        icon={Flag03Icon}
        label="Filter by tags"
        isActive={selectedTags.size > 0}
        popoverAlign="start"
        popoverClassName="w-72 p-3"
    >
        <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Filter by tag</p>
            {selectedTags.size > 0 && (
                <button
                    type="button"
                    onClick={onClearTags}
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                >
                    Clear all
                </button>
            )}
        </div>
        <div className="flex flex-wrap gap-1.5">
            {ALL_TAG_NAMES.map((tag) => (
                <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(tag)}
                    className="cursor-pointer"
                >
                    <EntryTag name={tag} active={selectedTags.has(tag)} />
                </button>
            ))}
        </div>
    </FilterButton>
);

export { TagFilter, type TagFilterProps };
