import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/onboarding-preview/route";
import { generateOnboardingPreview } from "@/lib/onboarding/service";

vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServer: vi.fn(() => Promise.resolve({})),
}));

vi.mock("@/lib/onboarding/service", () => ({
    generateOnboardingPreview: vi.fn(),
}));

const validBody = {
    entry_id: "00000000-0000-4000-8000-000000000000",
    content: "This is a valid onboarding reflection.",
    insight: "A valid insight.",
    tags: ["Growth"],
};

const makeRequest = (body: unknown) =>
    new Request("http://localhost/api/onboarding-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    }) as never;

describe("POST /api/onboarding-preview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as never);
    });

    it("does not call generation for invalid bodies", async () => {
        const response = await POST(makeRequest({ content: "short" }));

        expect(response.status).toBe(400);
        expect(generateOnboardingPreview).not.toHaveBeenCalled();
    });

    it("returns 500 when generation fails", async () => {
        vi.mocked(generateOnboardingPreview).mockResolvedValue({
            error: "Failed to generate preview",
        });

        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "Failed to generate preview",
        });
    });
});
