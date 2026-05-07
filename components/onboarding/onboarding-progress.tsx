"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
    currentStep: number;
    totalSteps?: number;
    /** 1–5, only used when currentStep === 2 (persona step) to show inner fill */
    personaInnerStep?: number;
    onBack?: () => void;
    onForward?: () => void;
}

const PERSONA_STEP = 2;
const PERSONA_INNER_STEPS = 5;

const OnboardingProgress = ({
    currentStep,
    totalSteps = 6,
    personaInnerStep,
    onBack,
    onForward,
}: OnboardingProgressProps) => {
    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={onBack}
                disabled={!onBack}
                className={cn(
                    "size-6 flex items-center justify-center rounded-full transition-colors",
                    onBack
                        ? "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                        : "invisible",
                )}
                aria-label="Previous step"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
            </button>

            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const step = i + 1;
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    const isPersonaFilling =
                        isActive &&
                        step === PERSONA_STEP &&
                        personaInnerStep !== undefined &&
                        personaInnerStep < PERSONA_INNER_STEPS;

                    const pillClass = isPersonaFilling
                        ? "bg-neutral-300 ring-2 ring-neutral-300"
                        : isActive || isCompleted
                          ? "bg-slate-400 ring-2 ring-neutral-300"
                          : "bg-neutral-300";

                    return (
                        <motion.div
                            key={step}
                            className={cn(
                                "relative h-3 rounded-full overflow-hidden",
                                pillClass,
                            )}
                            animate={{ width: isActive ? 64 : 12 }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 75,
                            }}
                        >
                            {isActive && !isPersonaFilling && (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(247,107,21,0.6)_0%,transparent_70%)]" />
                            )}
                            {isPersonaFilling && (
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-slate-400 overflow-hidden rounded-full"
                                    animate={{
                                        width: `${((personaInnerStep ?? 0) / PERSONA_INNER_STEPS) * 100}%`,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 40,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,rgba(251,146,60,0.75)_5%,rgba(255,115,1,0.45)_20%,transparent_55%)]" />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onForward}
                disabled={!onForward}
                className={cn(
                    "size-6 flex items-center justify-center rounded-full transition-colors",
                    onForward
                        ? "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                        : "invisible",
                )}
                aria-label="Next step"
            >
                <HugeiconsIcon icon={ArrowRight01Icon} />
            </button>
        </div>
    );
};

export { OnboardingProgress };
