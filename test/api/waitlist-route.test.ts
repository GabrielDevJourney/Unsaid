import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/waitlist/route";
import { addToWaitlist } from "@/lib/waitlist/service";

vi.mock("@/lib/supabase/admin", () => ({
    createSupabaseAdmin: vi.fn(() => ({})),
}));

vi.mock("@/lib/email/service", () => ({
    sendWaitlistConfirmationEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/waitlist/service", () => ({
    addToWaitlist: vi.fn(),
}));

const makeRequest = () =>
    new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-forwarded-for": "203.0.113.1",
        },
        body: JSON.stringify({
            email: "a@example.com",
            source: "landing_page",
        }),
    });

describe("POST /api/waitlist", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns success for a valid signup within the limit", async () => {
        vi.mocked(addToWaitlist).mockResolvedValue({
            data: {
                message: "You're on the list! We'll be in touch soon.",
                isExisting: false,
                position: null,
            },
        });

        const response = await POST(makeRequest());

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            data: { message: "You're on the list! We'll be in touch soon." },
        });
    });

    it("maps repeated signups to 429", async () => {
        vi.mocked(addToWaitlist).mockResolvedValue({ error: "rate_limit" });

        const response = await POST(makeRequest());

        expect(response.status).toBe(429);
        await expect(response.json()).resolves.toEqual({
            error: "Too many requests. Please try again later.",
        });
    });
});
