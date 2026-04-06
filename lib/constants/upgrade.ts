// Falls back to "#" in local/preview environments where the env var is not set
export const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "#";

// Teaser fill for gate and upgrade page — shows what the bar looks like, not real progress
export const GATE_BAR_FILL_PCT = 52;
