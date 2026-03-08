"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DeleteConfirmPopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title: string;
    description: string;
    children: React.ReactNode;
}

const DeleteConfirmPopover = ({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
    title,
    description,
    children,
}: DeleteConfirmPopoverProps) => (
    <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-86 p-4 shadow-lg" side="top" align="end">
            <div className="flex flex-col items-center gap-2 text-center ">
                <div className="flex size-12 items-center justify-center rounded-lg bg-red-100">
                    <HugeiconsIcon
                        icon={Alert02Icon}
                        className="size-6 text-red-500"
                        strokeWidth={1.5}
                    />
                </div>
                <div className="px-4">
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="flex w-full gap-2 justify-center mt-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="w-26 h-9 rounded-sm bg-neutral-200 text-foreground transition-colors hover:bg-neutral-300"
                    >
                        No, Keep It
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className=" w-26 h-9 rounded-sm bg-red-500 text-white transition-colors hover:bg-red-600/90 disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </PopoverContent>
    </Popover>
);

export { DeleteConfirmPopover };
