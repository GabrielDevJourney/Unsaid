"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
    currentStep: number;
    totalSteps?: number;
    onBack?: () => void;
    onForward?: () => void;
}

const OnboardingProgress = ({
    currentStep,
    totalSteps = 5,
    onBack,
    onForward,
}: OnboardingProgressProps) => {
    return (
        <div className="flex items-center gap-3">
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

                    return (
                        <motion.div
                            key={step}
                            className={cn(
                                "relative h-3 rounded-full overflow-hidden",
                                isActive || isCompleted
                                    ? "bg-slate-400 ring-2 ring-neutral-300"
                                    : "bg-neutral-300",
                            )}
                            animate={{ width: isActive ? 64 : 12 }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 75,
                            }}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(247,107,21,0.6)_0%,transparent_70%)]" />
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
