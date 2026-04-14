"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const backstageNavItems = [
    {
        label: "Feedback",
        href: "/backstage/feedback",
    },
    {
        label: "Emails",
        href: "/backstage/emails",
    },
];

const BackstageNav = () => {
    const pathname = usePathname();

    return (
        <nav className="border-b">
            <div className="mx-auto flex max-w-3xl items-center gap-6 px-10">
                {backstageNavItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                "inline-flex h-12 items-center border-b-2 text-sm transition-colors",
                                isActive
                                    ? "border-zinc-800 font-medium text-zinc-900"
                                    : "border-transparent text-muted-foreground hover:text-zinc-700",
                            ].join(" ")}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export { BackstageNav };
