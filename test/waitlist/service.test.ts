import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit } from "@/lib/rate-limits/service";
import { countWaitlistEntries, createWaitlistEntry } from "@/lib/waitlist/repo";
import { addToWaitlist } from "@/lib/waitlist/service";

vi.mock("@/lib/rate-limits/service", () => ({
    consumeRateLimit: vi.fn(),
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
        vi.mocked(consumeRateLimit).mockResolvedValue({ data: null });
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
    });

    it("returns a rate-limit error before inserting repeated signups", async () => {
        vi.mocked(consumeRateLimit).mockResolvedValue({ error: "rate_limit" });

        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({ error: "rate_limit" });
        expect(createWaitlistEntry).not.toHaveBeenCalled();
    });
});
