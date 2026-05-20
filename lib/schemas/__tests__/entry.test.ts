import { describe, expect, it } from "vitest";
import { EntryCreateSchema, PaginationSchema } from "../entry";

const validContent = "A".repeat(10);

describe("EntryCreateSchema", () => {
    describe("content", () => {
        it("accepts content at minimum length", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
            });
            expect(result.success).toBe(true);
        });

        it("rejects content below minimum length", () => {
            const result = EntryCreateSchema.safeParse({ content: "short" });
            expect(result.success).toBe(false);
        });

        it("rejects content above maximum length", () => {
            const result = EntryCreateSchema.safeParse({
                content: "A".repeat(16001),
            });
            expect(result.success).toBe(false);
        });
    });

    describe("sourceType", () => {
        it("accepts valid enum values", () => {
            for (const sourceType of [
                "onboarding",
                "pattern",
                "progress",
            ] as const) {
                const result = EntryCreateSchema.safeParse({
                    content: validContent,
                    sourceType,
                });
                expect(result.success).toBe(true);
            }
        });

        it("rejects arbitrary strings", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
                sourceType: "admin",
            });
            expect(result.success).toBe(false);
        });

        it("accepts null", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
                sourceType: null,
            });
            expect(result.success).toBe(true);
        });

        it("accepts omitted field", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
            });
            expect(result.success).toBe(true);
        });
    });

    describe("sourceId", () => {
        it("accepts a valid UUID", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
                sourceId: "123e4567-e89b-12d3-a456-426614174000",
            });
            expect(result.success).toBe(true);
        });

        it("rejects a non-UUID string", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
                sourceId: "not-a-uuid",
            });
            expect(result.success).toBe(false);
        });

        it("accepts null", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
                sourceId: null,
            });
            expect(result.success).toBe(true);
        });

        it("accepts omitted field", () => {
            const result = EntryCreateSchema.safeParse({
                content: validContent,
            });
            expect(result.success).toBe(true);
        });
    });
});

describe("PaginationSchema", () => {
    it("coerces string numbers", () => {
        const result = PaginationSchema.safeParse({
            page: "2",
            pageSize: "50",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(2);
            expect(result.data.pageSize).toBe(50);
        }
    });

    it("defaults page to 1 and pageSize to 20", () => {
        const result = PaginationSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(1);
            expect(result.data.pageSize).toBe(20);
        }
    });

    it("rejects pageSize above 100", () => {
        const result = PaginationSchema.safeParse({
            page: "1",
            pageSize: "101",
        });
        expect(result.success).toBe(false);
    });

    it("rejects non-positive page", () => {
        const result = PaginationSchema.safeParse({
            page: "0",
            pageSize: "20",
        });
        expect(result.success).toBe(false);
    });
});
