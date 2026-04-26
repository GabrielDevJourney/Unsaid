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
    useSidebar,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types/navigation";

interface SidebarNavGroupProps {
    items: NavItem[];
    label?: string;
    className?: string;
    children?: React.ReactNode;
}

export const SidebarNavGroup = ({
    items,
    label,
    className,
    children,
}: SidebarNavGroupProps) => {
    const pathname = usePathname();
    const { state } = useSidebar();

    const badgeStyles = {
        slate: {
            dot: "bg-slate-400 border-slate-200",
            pill: "bg-slate-100 border-slate-400 text-slate-800",
        },
        orange: {
            dot: "bg-orange-400 border-orange-200",
            pill: "bg-orange-100 border-orange-400 text-orange-500",
        },
    } as const;

    return (
        <SidebarGroup className={className}>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {children}
                {items.map((item) => {
                    const colors = badgeStyles[item.badgeColor ?? "slate"];
                    const hasBadge = item.badge != null && item.badge > 0;
                    return (
                        <SidebarMenuItem key={item.label}>
                            {/* Dot — only visible in collapsed state */}
                            {hasBadge && (
                                <span
                                    className={`absolute top-1 right-2.5 border-2 w-3 h-3 rounded-full transition-opacity duration-400 ease-in-out ${state === "collapsed" ? "opacity-100" : "opacity-0"} ${colors.dot}`}
                                />
                            )}
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.url}
                            >
                                <Link href={item.url}>
                                    <HugeiconsIcon
                                        strokeWidth={1}
                                        icon={item.icon}
                                        className={
                                            pathname === item.url
                                                ? "text-zinc-600"
                                                : "text-muted-foreground"
                                        }
                                    />
                                    <span>{item.label}</span>
                                    {/* Pill — only rendered in expanded state */}
                                    {hasBadge && state === "expanded" && (
                                        <span
                                            className={`ml-auto inline-flex h-5 min-w-6 items-center justify-center rounded-full border px-2 text-[12px] font-medium ${colors.pill}`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
};
