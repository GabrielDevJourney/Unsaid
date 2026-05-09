"use client";

import { Upload01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const TITLE_MAX = 200;

interface SubmitFeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userFirstName: string;
    userAvatarUrl: string | null;
}

type DialogState = "form" | "success";

const SubmitFeedbackDialog = ({
    open,
    onOpenChange,
    userFirstName,
    userAvatarUrl,
}: SubmitFeedbackDialogProps) => {
    const [state, setState] = useState<DialogState>("form");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setState("form");
        setTitle("");
        setDescription("");
        setIsAnonymous(false);
        setImageFile(null);
        setImagePreview(null);
        setError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) {
            setError("Only PNG and JPG files are accepted.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            let imageUrl: string | null = null;

            if (imageFile) {
                const fd = new FormData();
                fd.append("file", imageFile);
                const res = await fetch("/api/feedback/upload", {
                    method: "POST",
                    body: fd,
                });
                const json = await res.json();
                if (!res.ok || json.error) {
                    setError(json.error ?? "Image upload failed. Try again.");
                    return;
                }
                imageUrl = json.data.url;
            }

            const result = await submitFeedbackAction(
                title.trim(),
                description.trim(),
                isAnonymous,
                isAnonymous ? null : userFirstName,
                imageUrl,
            );

            if (result.error) {
                if (result.error === "rate_limit") {
                    setError(
                        "You've reached the limit of 10 submissions per day. Try again tomorrow.",
                    );
                } else {
                    setError(result.error);
                }
                return;
            }

            setState("success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const initials = userFirstName ? userFirstName[0].toUpperCase() : "?";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg gap-0 p-8">
                <DialogHeader className="pb-4 gap-0">
                    <DialogTitle className="font-serif text-2xl italic font-normal text-neutral-600">
                        Submit feedback
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Tell us what&apos;s working, what&apos;s broken, or what
                        you wish existed.
                    </p>
                </DialogHeader>

                {state === "form" ? (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                    >
                        {/* Title */}
                        <div className="relative">
                            <input
                                type="text"
                                required
                                minLength={5}
                                maxLength={TITLE_MAX}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Give it a headline"
                                className="h-9 w-full rounded-md border border-input bg-background px-3 pr-16 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {title.length}/{TITLE_MAX}
                            </span>
                        </div>

                        {/* Description */}
                        <Textarea
                            required
                            minLength={10}
                            maxLength={2000}
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us more. What would you say if you knew we were listening?"
                        />

                        {/* Media upload */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                    fileInputRef.current?.click();
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="flex cursor-pointer items-start justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:bg-muted/50"
                        >
                            {imagePreview ? (
                                // biome-ignore lint/performance/noImgElement: blob: URL preview — next/image doesn't support blob: URLs
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-40 w-full rounded-md object-contain bg-zinc-100"
                                />
                            ) : (
                                <div className="flex gap-4 items-center">
                                    <div className="p-2.5 flex items-center justify-center bg-neutral-200 rounded-lg">
                                        <HugeiconsIcon
                                            icon={Upload01Icon}
                                            size={18}
                                        />
                                    </div>
                                    <div className="bg-accent flex flex-col items-start">
                                        <p className="text-sm text-zinc-600">
                                            Drag and drop or upload media{" "}
                                            <span className="text-neutral-600">
                                                (optional)
                                            </span>
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            PNG, JPG up to 10 MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Identity row */}
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                            {/* Avatar */}
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                                {userAvatarUrl ? (
                                    <Image
                                        src={userAvatarUrl}
                                        alt={userFirstName}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="flex size-full items-center justify-center text-xs font-semibold text-zinc-600">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-800 truncate">
                                    {isAnonymous
                                        ? "You are posting anonymously"
                                        : `Posting as ${userFirstName}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isAnonymous
                                        ? "Your name won't be shown"
                                        : "Your name will be visible on the post"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-zinc-500">
                                    Post anonymously
                                </span>
                                <Switch
                                    checked={isAnonymous}
                                    onCheckedChange={setIsAnonymous}
                                    variant="sunrise"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                                You can submit up to 10 posts per day.
                            </p>
                            <Button
                                type="submit"
                                variant="sunrise"
                                disabled={isSubmitting}
                                className="ring-2"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 px-8 py-10 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                            <svg
                                aria-hidden="true"
                                className="size-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="text-base font-medium text-zinc-700 leading-relaxed">
                            Got it. We read every submission — yours helps shape
                            what Unsaid becomes.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export { SubmitFeedbackDialog };
