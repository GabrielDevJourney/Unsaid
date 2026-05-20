import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, RATE_LIMIT_ERROR } from "@/lib/rate-limits/service";
import {
    countWaitlistEntries,
    createWaitlistEntry,
    findWaitlistEntryByEmail,
} from "@/lib/waitlist/repo";
import { addToWaitlist } from "@/lib/waitlist/service";

vi.mock("@/lib/rate-limits/service", () => ({
    consumeRateLimit: vi.fn(),
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
        vi.mocked(findWaitlistEntryByEmail).mockResolvedValue({
            data: null,
            error: null,
        } as never);
        vi.mocked(consumeRateLimit).mockResolvedValue({ data: null } as never);
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

    it("returns existing message when email is already on the waitlist", async () => {
        vi.mocked(findWaitlistEntryByEmail).mockResolvedValue({
            data: { email: "a@example.com" },
            error: null,
        } as never);

        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({
            data: {
                message: "You're already on the waitlist!",
                isExisting: true,
                position: null,
            },
        });
        expect(consumeRateLimit).not.toHaveBeenCalled();
        expect(createWaitlistEntry).not.toHaveBeenCalled();
    });

    it("returns a rate-limit error when consumeRateLimit blocks the request", async () => {
        vi.mocked(consumeRateLimit).mockResolvedValue({
            error: RATE_LIMIT_ERROR,
        } as never);

        const result = await addToWaitlist(
            supabase,
            "a@example.com",
            "landing_page",
            "203.0.113.1",
        );

        expect(result).toEqual({ error: RATE_LIMIT_ERROR });
        expect(createWaitlistEntry).not.toHaveBeenCalled();
    });

    it("returns an error when signup fails", async () => {
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
    });
});
