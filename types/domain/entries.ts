import type { Tables } from "../database";

// 1. Raw Types from the Database
export type Entry = Tables<"entries">;

// 2. Domain Enums/Unions

// 3. Service Payloads (Inputs)
export interface CreateEntryPayload {
    content: string;
}

export interface InsertEntryData {
    userId: string;
    content: string;
    wordCount: number;
}

// 4. Enhanced Domain Model (Outputs)
export interface PaginatedEntries {
    data: Entry[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
}

export interface RateLimitResult {
    allowed: boolean;
    reason?: string;
}
