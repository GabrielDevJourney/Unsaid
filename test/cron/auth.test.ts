import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateCronRequest } from "@/lib/cron/auth";

vi.mock("@sentry/nextjs", () => ({
    captureMessage: vi.fn(),
}));

const makeRequest = (authorization?: string) =>
    new Request("http://localhost/api/cron/test", {
        headers: authorization ? { authorization } : undefined,
    }) as never;

describe("validateCronRequest", () => {
    const originalSecret = process.env.CRON_SECRET;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalSecret;
    });

    it("returns 500 and reports to Sentry when CRON_SECRET is missing", async () => {
        delete process.env.CRON_SECRET;

        const response = validateCronRequest(makeRequest(), "test-job");

        expect(response?.status).toBe(500);
        await expect(response?.json()).resolves.toEqual({
            error: "Server configuration error",
        });
        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            "CRON_SECRET not configured",
            {
                level: "error",
                tags: { jobName: "test-job" },
            },
        );
    });

    it("returns 401 for invalid auth", async () => {
        process.env.CRON_SECRET = "secret";

        const response = validateCronRequest(
            makeRequest("Bearer wrong"),
            "test-job",
        );

        expect(response?.status).toBe(401);
        await expect(response?.json()).resolves.toEqual({
            error: "Unauthorized",
        });
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it("returns null for valid auth", () => {
        process.env.CRON_SECRET = "secret";

        const response = validateCronRequest(
            makeRequest("Bearer secret"),
            "test-job",
        );

        expect(response).toBeNull();
    });
});
