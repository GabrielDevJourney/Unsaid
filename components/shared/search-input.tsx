"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_OVERLAY_TRANSITION = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
} as const;

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Animated search field. Mobile: icon button → full-width overlay with slide-in animation.
 * Desktop: inline input. Parent must have `relative` positioning for the overlay to cover it.
 */
const SearchInput = ({
    value,
    onChange,
    placeholder = "Search...",
}: SearchInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const id = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(id);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <>
            {/* Mobile: compact icon button */}
            <Button
                variant="outline"
                size="icon-lg"
                className={`md:hidden bg-card shrink-0 ${value.length > 0 ? "ring-2 ring-zinc-400" : ""}`}
                onClick={() => setIsOpen(true)}
            >
                <HugeiconsIcon
                    icon={Search01Icon}
                    className="size-4 text-muted-foreground"
                />
            </Button>

            {/* Desktop: inline input */}
            <div className="relative hidden md:flex flex-1">
                <HugeiconsIcon
                    icon={Search01Icon}
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-full rounded-lg bg-card pl-9 text-muted-foreground font-medium"
                />
            </div>

            {/* Mobile animated overlay — covers parent (parent must be relative) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={overlayRef}
                        className="md:hidden absolute inset-0 z-10 flex items-center gap-2 bg-background py-2"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={SEARCH_OVERLAY_TRANSITION}
                    >
                        <div className="relative flex-1">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                ref={inputRef}
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setIsOpen(false);
                                }}
                                className="h-10 rounded-lg bg-card pl-9 text-muted-foreground font-medium"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="shrink-0"
                            onClick={() => setIsOpen(false)}
                        >
                            <HugeiconsIcon
                                icon={Cancel01Icon}
                                className="size-4 text-muted-foreground"
                            />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { SearchInput, type SearchInputProps };
