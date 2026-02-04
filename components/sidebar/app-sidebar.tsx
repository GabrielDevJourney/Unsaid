"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
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
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { brainNavItems, footerNavItems } from "@/config/sidebar";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SidebarUser } from "./sidebar-user";

export const AppSidebar = () => {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex-row items-center justify-between p-8 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:relative group-data-[state=collapsed]:h-14">
                <Link
                    href="/home"
                    className="font-serif text-2xl font-medium group-data-[state=collapsed]:hidden flex-2 text-center"
                >
                    unsaid.
                </Link>
                <SidebarTrigger className="group-data-[state=collapsed]:absolute group-data-[state=collapsed]:left-full group-data-[state=collapsed]:-translate-x-1/2 group-data-[state=collapsed]:top-1/2 group-data-[state=collapsed]:-translate-y-1/2 group-data-[state=collapsed]:z-20 flex-1" />
            </SidebarHeader>

            <SidebarContent className="group-data-[state=collapsed]:mt-16">
                <SidebarGroup className="p-4">
                    <SidebarGroupLabel>Journaling</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Link
                            href="/entries/new"
                            className="btn-add-entry text-zinc-600 w-36 h-10 group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:border-none group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:ring-6 group-data-[state=collapsed]:ring-border group-data-[state=collapsed]:rounded-md"
                        >
                            <span className="group-data-[state=collapsed]:hidden">
                                Add entry
                            </span>
                            <span className="btn-add-entry-icon bg-slate-500 group-data-[state=collapsed]:rounded-md group-data-[state=collapsed]:w-full group-data-[state=collapsed]:h-full">
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
                <SidebarUser
                    name="Gabi"
                    email="gabi@example.com"
                    initials="G"
                />
            </SidebarFooter>
        </Sidebar>
    );
};
