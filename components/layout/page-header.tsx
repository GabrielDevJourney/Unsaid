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
            className={cn(
                "flex h-24 shrink-0 items-center border-b px-10",
                className,
            )}
        >
            {backHref && (
                <Link
                    href={backHref}
                    className="mr-4 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft02Icon}
                        className="size-5"
                        strokeWidth={1.5}
                    />
                </Link>
            )}
            {children}
        </header>
    );
};

export { PageHeader };
