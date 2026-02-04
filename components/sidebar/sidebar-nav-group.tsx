"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types/navigation";

interface SidebarNavGroupProps {
    items: NavItem[];
    label?: string;
    className?: string;
}

export const SidebarNavGroup = ({
    items,
    label,
    className,
}: SidebarNavGroupProps) => {
    const pathname = usePathname();

    return (
        <SidebarGroup className={className}>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.url}
                        >
                            <Link href={item.url}>
                                <HugeiconsIcon
                                    strokeWidth={1.5}
                                    icon={item.icon}
                                    className={
                                        pathname === item.url
                                            ? "text-zinc-600"
                                            : "text-muted-foreground"
                                    }
                                />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
};
