import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarUserProps {
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
}

export const SidebarUser = ({
    name,
    email,
    avatarUrl,
    initials,
}: SidebarUserProps) => {
    return (
        <div className="flex items-center border-t gap-3 p-6 group-data-[state=collapsed]:justify-center">
            <Avatar className="size-10 group-data-[state=collapsed]:size-8">
                <AvatarImage src={avatarUrl} alt={`${name} avatar`} />
                <AvatarFallback className="bg-neutral-700 text-white">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col group-data-[state=collapsed]:hidden">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">
                    {email}
                </span>
            </div>
        </div>
    );
};
