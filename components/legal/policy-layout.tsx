"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

interface PolicyLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

const PolicyLayout = ({ title, lastUpdated, children }: PolicyLayoutProps) => {
    const router = useRouter();

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-primary-foreground px-4 py-12">
            <div className="w-full max-w-4xl">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 rounded-lg border bg-input px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-neutral-200 cursor-pointer"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    Back
                </button>

                <h1 className="font-serif italic text-4xl mb-8 text-neutral-700">
                    {title}
                </h1>

                <div className="relative rounded-xl border overflow-hidden">
                    <div className="overflow-y-auto max-h-[70vh] p-8">
                        <p className="text-xs text-muted-foreground mb-6">
                            Last Updated: {lastUpdated}
                        </p>
                        <div className="prose prose-sm max-w-none text-foreground [&_h2]:text-neutral-600 [&_h2]:text-lg [&_strong]:text-neutral-600">
                            {children}
                        </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-linear-to-t from-white to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default PolicyLayout;
