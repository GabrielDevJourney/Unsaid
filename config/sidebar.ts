import {
    Activity01Icon,
    BookOpen01Icon,
    DashboardSquare01Icon,
    SentIcon,
    Settings01Icon,
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
    },
];

export const footerNavItems: NavItem[] = [
    {
        label: "Settings",
        icon: Settings01Icon,
        url: "/settings",
    },
    {
        label: "Feedback",
        icon: SentIcon,
        url: "/feedback",
    },
];
