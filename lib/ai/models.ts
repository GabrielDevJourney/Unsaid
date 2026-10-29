import type { AnthropicProviderOptions } from "@ai-sdk/anthropic";

/** Single source of truth for model IDs. Prices and rationale: docs/costs-overview.md */
export const HAIKU_MODEL = "claude-haiku-5-5";
export const SONNET_MODEL = "claude-sonnet-5-5";

/**
 * Sonnet 5.5 thinks by default (effort defaults to high) and thinking is billed
 * as output. Medium keeps quality for journaling insights at a lower cost.
 * Haiku 5.5 is left on its default (medium).
 */
export const SONNET_PROVIDER_OPTIONS = {
    anthropic: { effort: "medium" } satisfies AnthropicProviderOptions,
};
