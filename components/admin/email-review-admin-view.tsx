"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DELIVERABILITY_CHECKLIST,
    REVIEW_PRESET_OPTIONS,
    REVIEW_TEMPLATE_OPTIONS,
} from "@/lib/email/review";

interface EmailReviewAdminViewProps {
    defaultEmail?: string;
}

type SendResult = {
    template: string;
    success: boolean;
    error?: string;
};

const EmailReviewAdminView = ({
    defaultEmail = "",
}: EmailReviewAdminViewProps) => {
    const [email, setEmail] = useState(defaultEmail);
    const [template, setTemplate] = useState("all");
    const [preset, setPreset] = useState("default");
    const [status, setStatus] = useState<string | null>(null);
    const [results, setResults] = useState<SendResult[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleSend = () => {
        setStatus(null);
        setResults([]);

        startTransition(async () => {
            const response = await fetch("/api/admin/email-review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    template,
                    preset,
                }),
            });

            const payload = (await response.json()) as {
                data?: { sent: number; failed: number; results: SendResult[] };
                error?: string;
            };

            if (!response.ok || payload.error) {
                setStatus(payload.error ?? "Failed to send review email");
                return;
            }

            setResults(payload.data?.results ?? []);
            setStatus(
                `Sent ${payload.data?.sent ?? 0} template(s), failed ${payload.data?.failed ?? 0}.`,
            );
        });
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-8">
                <section className="rounded-2xl border bg-card p-6">
                    <h2 className="text-lg font-semibold text-zinc-800">
                        Send review emails
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Send one template or all templates through the real
                        Resend pipeline so you can inspect delivery in
                        production and in the Resend dashboard.
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label
                                htmlFor="review-email"
                                className="mb-2 block text-sm font-medium text-zinc-800"
                            >
                                Recipient email
                            </label>
                            <Input
                                id="review-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="review-template"
                                className="mb-2 block text-sm font-medium text-zinc-800"
                            >
                                Template
                            </label>
                            <select
                                id="review-template"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-zinc-800"
                            >
                                {REVIEW_TEMPLATE_OPTIONS.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="review-preset"
                                className="mb-2 block text-sm font-medium text-zinc-800"
                            >
                                Preset
                            </label>
                            <select
                                id="review-preset"
                                value={preset}
                                onChange={(e) => setPreset(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-zinc-800"
                            >
                                {REVIEW_PRESET_OPTIONS.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <Button
                            variant="sunrise"
                            onClick={handleSend}
                            disabled={isPending || !email}
                        >
                            {isPending ? "Sending..." : "Send review email"}
                        </Button>
                    </div>

                    {status ? (
                        <p className="mt-4 text-sm text-zinc-700">{status}</p>
                    ) : null}

                    {results.length > 0 ? (
                        <div className="mt-4 flex flex-col gap-2">
                            {results.map((result) => (
                                <div
                                    key={result.template}
                                    className="rounded-xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
                                >
                                    <strong className="capitalize">
                                        {result.template}
                                    </strong>
                                    :{" "}
                                    {result.success
                                        ? "sent"
                                        : (result.error ?? "failed")}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="rounded-2xl border bg-card p-6">
                    <h2 className="text-lg font-semibold text-zinc-800">
                        Deliverability checklist
                    </h2>
                    <div className="mt-4 flex flex-col gap-3">
                        {DELIVERABILITY_CHECKLIST.map((item) => (
                            <div
                                key={item}
                                className="rounded-xl border bg-zinc-50 px-4 py-3 text-sm leading-6 text-muted-foreground"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export { EmailReviewAdminView };
