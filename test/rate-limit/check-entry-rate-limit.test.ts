import { describe, expect, it, vi } from "vitest";
import { checkEntryRateLimit } from "@/lib/rate-limit";

const makeSupabase = (
    count: number | null,
    error: { message: string } | null = null,
) => ({
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
            count: "exact",
            head: true,
            gte: vi.fn().mockResolvedValue({ count, error }),
        }),
    }),
});

describe("checkEntryRateLimit", () => {
    it("allows when count is below daily limit", async () => {
        const supabase = makeSupabase(5);
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: true });
    });

    it("allows when count is exactly one below the limit", async () => {
        const supabase = makeSupabase(19);
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: true });
    });

    it("blocks when count equals the daily limit", async () => {
        const supabase = makeSupabase(20);
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: false });
    });

    it("blocks when count exceeds the daily limit", async () => {
        const supabase = makeSupabase(25);
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: false });
    });

    it("fails open when the query errors (prefer availability over rate limiting)", async () => {
        const supabase = makeSupabase(null, { message: "DB error" });
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: true });
    });

    it("treats null count as zero", async () => {
        const supabase = makeSupabase(null, null);
        const result = await checkEntryRateLimit(supabase as never, "user-1");
        expect(result).toEqual({ allowed: true });
    });
});
