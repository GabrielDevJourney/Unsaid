import { cn } from "@/lib/utils";

interface PageHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const PageHeader = ({ children, className }: PageHeaderProps) => {
    return (
        <header
            className={cn(
                "flex h-24 shrink-0 items-center border-b px-6",
                className,
            )}
        >
            <div className="w-full max-w-5xl">{children}</div>
        </header>
    );
};

export { PageHeader };
