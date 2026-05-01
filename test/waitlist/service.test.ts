import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    checkRateLimit,
    recordRateLimitUsage,
} from "@/lib/rate-limits/service";
import { countWaitlistEntries, createWaitlistEntry } from "@/lib/waitlist/repo";
import { addToWaitlist } from "@/lib/waitlist/service";

vi.mock("@/lib/rate-limits/service", () => ({
    checkRateLimit: vi.fn(),
    recordRateLimitUsage: vi.fn(),
    RATE_LIMIT_ERROR: "rate_limit",
    RATE_LIMIT_SCOPES: { waitlistSignup: "waitlist_signup" },
}));

vi.mock("@/lib/waitlist/repo", () => ({
    createWaitlistEntry: vi.fn(),
    countWaitlistEntries: vi.fn(),
    findWaitlistEntryByEmail: vi.fn(),
}));

const supabase = {} as SupabaseClient;

describe("addToWaitlist", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockResolvedValue({ data: null });
        vi.mocked(recordRateLimitUsage).mockResolvedValue(undefined);
        vi.mocked(createWaitlistEntry).mockResolvedValue({
            data: null,
            error: null,
        } as never);
        vi.mocked(countWaitlistEntries).mockResolvedValue({
            count: 7,
            error: null,
        } as never);
    });

    it("adds a waitlist signup within the rate limit", async () => {
        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({
            data: {
                message: "You're on the list! We'll be in touch soon.",
                isExisting: false,
                position: 7,
            },
        });
        expect(createWaitlistEntry).toHaveBeenCalledWith(
            supabase,
            "a@example.com",
            "landing_page",
        );
        expect(recordRateLimitUsage).toHaveBeenCalledOnce();
    });

    it("returns a rate-limit error before inserting repeated signups", async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ error: "rate_limit" });

        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({ error: "rate_limit" });
        expect(createWaitlistEntry).not.toHaveBeenCalled();
        expect(recordRateLimitUsage).not.toHaveBeenCalled();
    });

    it("does not record rate-limit usage when signup fails", async () => {
        vi.mocked(createWaitlistEntry).mockResolvedValue({
            data: null,
            error: { code: "500", message: "DB error" },
        } as never);

        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({ error: "Failed to add to waitlist" });
        expect(recordRateLimitUsage).not.toHaveBeenCalled();
    });
});
