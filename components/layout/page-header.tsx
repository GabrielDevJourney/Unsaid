"use client";

import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    children: React.ReactNode;
    className?: string;
    /** When provided, renders a back arrow Link before children. */
    backHref?: string;
}

const PageHeader = ({ children, className, backHref }: PageHeaderProps) => {
    return (
        <header
            className={cn("flex shrink-0 flex-col border-b h-24", className)}
        >
            <div className="flex items-center px-10 h-full">
                {backHref && (
                    <Link
                        href={backHref}
                        className="mr-4 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            className="size-5 text-zinc-600"
                            strokeWidth={1.5}
                        />
                    </Link>
                )}
                {children}
            </div>
        </header>
    );
};

export { PageHeader };
