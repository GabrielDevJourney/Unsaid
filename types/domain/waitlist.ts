import type { Tables, TablesInsert } from "../database";

// 1. Database Types (derived from generated types)
export type WaitlistRow = Tables<"waitlist">;
export type WaitlistInsert = TablesInsert<"waitlist">;

// 2. Service Response Types
export interface WaitlistSignupResult {
    message: string;
    isExisting: boolean;
}
