"use client";

import Image from "next/image";
import { useState } from "react";
import {
    addAdminReplyAction,
    approveFeedbackAction,
    rejectFeedbackAction,
    updateStatusAction,
} from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackStatusType } from "@/lib/schemas/feedback";
import { cn } from "@/lib/utils";
import type { FeedbackItem } from "@/types";

const STATUS_OPTIONS: { value: FeedbackStatusType; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "wont_do", label: "Won't Do" },
];

interface FeedbackAdminCardProps {
    item: FeedbackItem;
    isPending?: boolean;
    onApproved?: (item: FeedbackItem) => void;
    onRejected?: (feedbackId: string) => void;
    onUpdated?: (item: FeedbackItem) => void;
}

const FeedbackAdminCard = ({
    item,
    isPending = false,
    onApproved,
    onRejected,
    onUpdated,
}: FeedbackAdminCardProps) => {
    const [reply, setReply] = useState(item.admin_reply ?? "");
    const [status, setStatus] = useState<FeedbackStatusType>(item.status);
    const [isSavingReply, setIsSavingReply] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
        setIsApproving(true);
        setError(null);
        const result = await approveFeedbackAction(item.id);
        setIsApproving(false);
        if (result.error) {
            setError(result.error);
        } else if (result.data) {
            onApproved?.(result.data);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        setError(null);
        const result = await rejectFeedbackAction(item.id);
        setIsRejecting(false);
        if (result.error) {
            setError(result.error);
        } else {
            onRejected?.(item.id);
        }
    };

    const handleStatusChange = async (next: FeedbackStatusType) => {
        setStatus(next);
        setIsUpdatingStatus(true);
        const result = await updateStatusAction(item.id, next);
        setIsUpdatingStatus(false);
        if (result.error) {
            setError(result.error);
            setStatus(item.status);
        } else if (result.data) {
            onUpdated?.(result.data);
        }
    };

    const handleSaveReply = async () => {
        setIsSavingReply(true);
        setError(null);
        const result = await addAdminReplyAction(item.id, reply);
        setIsSavingReply(false);
        if (result.error) {
            setError(result.error);
        } else if (result.data) {
            onUpdated?.(result.data);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg italic text-zinc-800">
                    {item.title}
                </h3>
                <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>

            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {item.description}
            </p>

            {item.image_url && (
                <div className="relative mt-3 h-60 w-full overflow-hidden rounded-lg bg-zinc-100">
                    <Image
                        src={item.image_url}
                        alt="Attached screenshot"
                        fill
                        unoptimized
                        className="object-contain"
                    />
                </div>
            )}

            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

            {isPending ? (
                <div className="mt-4 flex gap-2">
                    <Button
                        size="sm"
                        variant="sunrise"
                        disabled={isApproving || isRejecting}
                        onClick={handleApprove}
                    >
                        {isApproving ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isApproving || isRejecting}
                        onClick={handleReject}
                    >
                        {isRejecting ? "Rejecting..." : "Reject"}
                    </Button>
                </div>
            ) : (
                <div className="mt-4 flex flex-col gap-4">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor={`status-${item.id}`}
                            className="text-sm font-medium text-zinc-700 shrink-0"
                        >
                            Status
                        </label>
                        <select
                            id={`status-${item.id}`}
                            value={status}
                            disabled={isUpdatingStatus}
                            onChange={(e) =>
                                handleStatusChange(
                                    e.target.value as FeedbackStatusType,
                                )
                            }
                            className={cn(
                                "rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring",
                                isUpdatingStatus && "opacity-60",
                            )}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {isUpdatingStatus && (
                            <span className="text-xs text-muted-foreground">
                                Saving...
                            </span>
                        )}
                    </div>

                    {/* Admin reply */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor={`reply-${item.id}`}
                            className="text-sm font-medium text-zinc-700"
                        >
                            Team reply
                        </label>
                        <Textarea
                            id={`reply-${item.id}`}
                            rows={3}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Leave a public response from The Unsaid Team..."
                        />
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isSavingReply || !reply.trim()}
                                onClick={handleSaveReply}
                            >
                                {isSavingReply ? "Saving..." : "Save reply"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { FeedbackAdminCard };
