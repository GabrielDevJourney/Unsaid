import { cn } from "@/lib/utils";

interface PageHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const PageHeader = ({ children, className }: PageHeaderProps) => {
    return (
        <header
            className={cn(
                "flex h-24 shrink-0 items-center border-b px-10",
                className,
            )}
        >
            {children}
        </header>
    );
};

export { PageHeader };
