import type { PatternTypeCode } from "@/lib/constants/pattern-types";

export const TYPE_BADGE_STYLES: Record<PatternTypeCode, string> = {
    recurring_theme: "border-green-400 bg-green-50 text-green-800",
    emotional_trigger: "border-red-400 bg-red-50 text-red-800",
    behavioral_pattern: "border-blue-400 bg-blue-50 text-blue-800",
    blind_spot: "border-purple-400 bg-purple-50 text-purple-800",
    unmet_need: "border-orange-400 bg-orange-50 text-orange-800",
    growth: "border-sky-400 bg-sky-50 text-sky-800",
};
