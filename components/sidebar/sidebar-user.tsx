"use client";

import {
    ArrowUp01Icon,
    Login01Icon,
    Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarUserProps {
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
    onSignOut: () => void;
}

export const SidebarUser = ({
    name,
    email,
    avatarUrl,
    initials,
    onSignOut,
}: SidebarUserProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <SidebarMenu className="border-t border-border p-6 transition-[padding] duration-400 ease-in-out group-data-[collapsible=icon]:px-5 group-data-[collapsible=icon]:py-6">
                <SidebarMenuItem>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton
                            size="default"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-[width,height,padding,gap] group-data-[collapsible=icon]:p-0!"
                        >
                            <Avatar
                                size="lg"
                                className="shrink-0 flex! duration-400 ease-in-out"
                            >
                                <AvatarImage
                                    src={avatarUrl}
                                    alt={`${name} avatar`}
                                />
                                <AvatarFallback className="bg-neutral-700 text-white text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col text-left overflow-hidden max-w-40 transition-[max-width,opacity] duration-400 ease-in-out group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0">
                                <span className="truncate text-sm font-medium">
                                    {name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {email}
                                </span>
                            </div>
                            <HugeiconsIcon
                                icon={ArrowUp01Icon}
                                className={`ml-auto size-5 shrink-0 text-muted-foreground overflow-hidden max-w-6 transition-[max-width,opacity] duration-400 ease-in-out group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0 ${open ? "rotate-0" : "rotate-180"}`}
                                strokeWidth={1.5}
                            />
                        </SidebarMenuButton>
                    </PopoverTrigger>
                </SidebarMenuItem>
            </SidebarMenu>

            <PopoverContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-56 p-1"
            >
                <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-zinc-600 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                    <HugeiconsIcon
                        icon={Settings01Icon}
                        strokeWidth={1.5}
                        className="size-5 shrink-0 text-muted-foreground"
                    />
                    <span>Settings</span>
                </Link>
                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        onSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-zinc-600 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                    <HugeiconsIcon
                        icon={Login01Icon}
                        strokeWidth={1.5}
                        className="size-5 shrink-0 text-muted-foreground"
                    />
                    <span>Logout</span>
                </button>
            </PopoverContent>
        </Popover>
    );
};
