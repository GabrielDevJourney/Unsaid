"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Add01Icon, Login01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { brainNavItems, footerNavItems } from "@/config/sidebar";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SidebarUser } from "./sidebar-user";

export const AppSidebar = () => {
    const { signOut } = useClerk();
    const { user } = useUser();

    const displayName = user?.username ?? user?.firstName ?? "User";
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
    const userInitials = displayName.charAt(0).toUpperCase();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-24 flex-row items-center justify-between border-b p-8 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:relative group-data-[state=collapsed]:h-24">
                <Link
                    href="/home"
                    className="font-serif text-2xl font-medium group-data-[state=collapsed]:hidden flex-2 text-center"
                >
                    unsaid.
                </Link>
                <SidebarTrigger className="group-data-[state=collapsed]:absolute group-data-[state=collapsed]:left-full group-data-[state=collapsed]:-translate-x-1/2 group-data-[state=collapsed]:top-1/2 group-data-[state=collapsed]:-translate-y-1/2 group-data-[state=collapsed]:z-20 flex-1 hover:bg-transparent" />
            </SidebarHeader>

            <SidebarContent className="group-data-[state=collapsed]:mt-4">
                <SidebarGroup className="p-4">
                    <SidebarGroupLabel>Journaling</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Link
                            href="/entries/new"
                            className="flex items-center text-zinc-600 w-36 h-10 group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:border-none group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:ring-6 group-data-[state=collapsed]:ring-border group-data-[state=collapsed]:rounded-md"
                        >
                            <span className="group-data-[state=collapsed]:hidden h-full flex-1 min-w-0 flex items-center justify-center border-y border-l border-border rounded-l-md text-zinc-600 bg-gray-3">
                                Add entry
                            </span>
                            <span className="btn-add-entry-icon bg-slate-400 group-data-[state=collapsed]:rounded-md relative flex items-center justify-center w-10 group-data-[state=collapsed]:w-8 shrink-0 h-full overflow-hidden cursor-pointer rounded-r-md">
                                <HugeiconsIcon
                                    icon={Add01Icon}
                                    className="relative z-10 size-5 text-white"
                                />
                            </span>
                        </Link>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarNavGroup
                    items={brainNavItems}
                    label="Brain"
                    className="p-4"
                />
            </SidebarContent>

            <SidebarFooter>
                <SidebarNavGroup items={footerNavItems} className="p-4" />
                <SidebarMenu className="px-4">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => signOut({ redirectUrl: "/sign-in" })}
                        >
                            <HugeiconsIcon
                                strokeWidth={1.5}
                                icon={Login01Icon}
                                className="text-muted-foreground"
                            />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarUser
                    name={displayName}
                    email={userEmail}
                    initials={userInitials}
                    avatarUrl={user?.imageUrl}
                />
            </SidebarFooter>
        </Sidebar>
    );
};
