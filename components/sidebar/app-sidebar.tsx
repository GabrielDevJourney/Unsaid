"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { adminNavItems, brainNavItems, footerNavItems } from "@/config/sidebar";
import { useSidebarBadgeStore } from "@/lib/stores/sidebar-badge-store";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SidebarUser } from "./sidebar-user";

interface AppSidebarProps {
    newPatternsCount?: number;
    newProgressCount?: number;
    isAdmin?: boolean;
}

export const AppSidebar = ({
    newPatternsCount = 0,
    newProgressCount = 0,
    isAdmin = false,
}: AppSidebarProps) => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const { progressAdjustment } = useSidebarBadgeStore();

    const displayName = user?.username ?? user?.firstName ?? "User";
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
    const userInitials = displayName.charAt(0).toUpperCase();

    const effectiveProgressCount = Math.max(
        0,
        newProgressCount - progressAdjustment,
    );

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-24 flex-row items-center justify-between border-b py-8 px-4 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:items-center group-data-[state=collapsed]:relative group-data-[state=collapsed]:h-24">
                <Link
                    href="/home"
                    className="font-serif text-2xl font-medium group-data-[state=open]:flex-2 text-center"
                >
                    <div className="h-full flex gap-2 items-center">
                        <Image
                            src="/logo-white-bg.svg"
                            alt="Unsaid logo with white background"
                            width={36}
                            height={36}
                        />
                        <Image
                            src="/logo-text.svg"
                            alt="Unsaid text logo with white background"
                            width={76}
                            height={36}
                            className="transition-opacity duration-400 ease-in-out group-data-[state=collapsed]:opacity-0"
                        />
                    </div>
                </Link>
                <SidebarTrigger className="group-data-[state=collapsed]:absolute group-data-[state=collapsed]:left-full group-data-[state=collapsed]:-translate-x-1/2 group-data-[state=collapsed]:top-5 group-data-[state=collapsed]:-translate-y-1/2 group-data-[state=collapsed]:z-20 group-data-[state=collapsed]:bg-neutral-100 group-data-[state=collapsed]:border group-data-[state=collapsed]:border-border" />
            </SidebarHeader>

            <SidebarContent>
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
                    items={brainNavItems.map((item) => {
                        if (item.url === "/patterns")
                            return { ...item, badge: newPatternsCount };
                        if (item.url === "/progress")
                            return { ...item, badge: effectiveProgressCount };
                        return item;
                    })}
                    label="Brain"
                    className="p-4"
                />
            </SidebarContent>

            <SidebarFooter>
                <SidebarNavGroup items={footerNavItems} className="p-4" />
                {isAdmin && (
                    <SidebarNavGroup
                        items={adminNavItems}
                        className="px-4 pb-1"
                    />
                )}
                <SidebarUser
                    name={displayName}
                    email={userEmail}
                    initials={userInitials}
                    avatarUrl={user?.imageUrl}
                    onSignOut={() => signOut({ redirectUrl: "/sign-in" })}
                />
            </SidebarFooter>
        </Sidebar>
    );
};
