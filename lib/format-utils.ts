/**
 * Format a price in cents to a display string (e.g. 1099 → "$10.99").
 */
export const formatPrice = (cents: number): string =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
