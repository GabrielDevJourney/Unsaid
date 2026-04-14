import {
    Activity01Icon,
    BookOpen01Icon,
    DashboardSquare01Icon,
    LockedIcon,
    SentIcon,
} from "@hugeicons/core-free-icons";
import type { NavItem } from "@/types/navigation";

export const brainNavItems: NavItem[] = [
    {
        label: "Mind Temple",
        icon: BookOpen01Icon,
        url: "/home",
    },
    {
        label: "Patterns",
        icon: DashboardSquare01Icon,
        url: "/patterns",
    },
    {
        label: "Progress",
        icon: Activity01Icon,
        url: "/progress",
        badgeColor: "orange",
    },
];

export const footerNavItems: NavItem[] = [
    {
        label: "Feedback",
        icon: SentIcon,
        url: "/feedback",
    },
];

export const adminNavItems: NavItem[] = [
    {
        label: "Backstage",
        icon: LockedIcon,
        url: "/backstage/feedback",
    },
];
