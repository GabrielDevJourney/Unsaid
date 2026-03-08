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
                        {item.badge != null && item.badge > 0 && (
                            <span
                                className="group-data-[state=expanded]:hidden absolute -top-1 -right-1 bg-slate-400         
                                border-2 border-slate-200 w-3 h-3 rounded-full"
                            ></span>
                        )}
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
                                {item.badge != null && item.badge > 0 && (
                                    <span className="ml-auto inline-flex h-5 min-w-4 items-center justify-center rounded-full bg-slate-100 border border-slate-400 px-2 text-[12px] font-medium text-slate-800">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
};
