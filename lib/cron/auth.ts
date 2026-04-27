import crypto from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export const validateCronRequest = (req: NextRequest, jobName: string) => {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET not configured", { jobName });
        Sentry.captureMessage("CRON_SECRET not configured", {
            level: "error",
            tags: { jobName },
        });
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const isValid =
        authHeader !== null &&
        authHeader.length === expectedHeader.length &&
        crypto.timingSafeEqual(
            Buffer.from(authHeader, "utf8"),
            Buffer.from(expectedHeader, "utf8"),
        );

    if (!isValid) {
        console.warn("Unauthorized cron request", { jobName });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
};
