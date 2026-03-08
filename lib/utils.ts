import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate } from "./date-utils";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date as a human-readable entry date.
 * Uses the user's system locale — no locale hardcoding.
 * Example (en-GB): "22 february 2026"
 * Example (en-US): "february 22, 2026"
 */
export const formatEntryDate = (date: Date | string): string => {
    return formatDate(date, {
        year: "numeric",
        month: "long",
        day: "2-digit",
    }).toLocaleLowerCase();
};
