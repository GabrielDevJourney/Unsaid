"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import type { FeedbackItem } from "@/types";
import { FeedbackAdminCard } from "./feedback-admin-card";

interface FeedbackAdminViewProps {
    initialPending: FeedbackItem[];
    initialApproved: FeedbackItem[];
}

const FeedbackAdminView = ({
    initialPending,
    initialApproved,
}: FeedbackAdminViewProps) => {
    const [pending, setPending] = useState<FeedbackItem[]>(initialPending);
    const [approved, setApproved] = useState<FeedbackItem[]>(initialApproved);

    const handleApproved = (item: FeedbackItem) => {
        setPending((prev) => prev.filter((p) => p.id !== item.id));
        setApproved((prev) => [item, ...prev]);
    };

    const handleRejected = (feedbackId: string) => {
        setPending((prev) => prev.filter((p) => p.id !== feedbackId));
    };

    const handleUpdated = (updated: FeedbackItem) => {
        setApproved((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
        );
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/home">
                <h1 className="font-serif text-3xl italic text-zinc-800">
                    Feedback — Admin
                </h1>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-10">
                    {/* Pending queue */}
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <h2 className="font-semibold text-zinc-800">
                                Pending Review
                            </h2>
                            {pending.length > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700">
                                    {pending.length}
                                </span>
                            )}
                        </div>

                        {pending.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No submissions waiting for review.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {pending.map((item) => (
                                    <FeedbackAdminCard
                                        key={item.id}
                                        item={item}
                                        isPending
                                        onApproved={handleApproved}
                                        onRejected={handleRejected}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Approved items */}
                    <section>
                        <h2 className="mb-4 font-semibold text-zinc-800">
                            Approved ({approved.length})
                        </h2>

                        {approved.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No approved feedback yet.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {approved.map((item) => (
                                    <FeedbackAdminCard
                                        key={item.id}
                                        item={item}
                                        onUpdated={handleUpdated}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export { FeedbackAdminView };
