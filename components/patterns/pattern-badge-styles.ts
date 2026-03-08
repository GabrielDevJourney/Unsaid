import type { PatternTypeCode } from "@/lib/constants/pattern-types";

export const TYPE_BADGE_STYLES: Record<PatternTypeCode, string> = {
    recurring_theme: "border-green-300 bg-green-100 text-green-800",
    emotional_trigger: "border-red-300 bg-red-100 text-red-800",
    behavioral_pattern: "border-blue-300 bg-blue-100 text-blue-800",
    blind_spot: "border-purple-300 bg-purple-100 text-purple-800",
    unmet_need: "border-orange-300 bg-orange-100 text-orange-800",
    growth: "border-sky-300 bg-sky-100 text-sky-800",
};
