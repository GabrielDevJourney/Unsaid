"use client";

import { useState } from "react";
import {
    completeOnboardingAction,
    skipOnboardingAction,
} from "@/app/actions/onboarding";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import type { OnboardingEntrySnapshot } from "@/lib/onboarding/service";
import type { OnboardingPreview } from "@/lib/schemas/onboarding-preview";
import { OnboardingProgress } from "./onboarding-progress";
import { CompletionStep } from "./steps/completion-step";
import { PatternsStep } from "./steps/patterns-step";
import { ProgressStep } from "./steps/progress-step";
import { ReflectionStep } from "./steps/reflection-step";
import { WelcomeStep } from "./steps/welcome-step";

type Step = 1 | 2 | 3 | 4 | 5;

interface WizardState {
    step: Step;
    maxStep: Step;
    entryId?: string;
    entryContent?: string;
    insightText?: string;
    insightTags?: InsightTagType[];
    previewPattern?: OnboardingPreview["pattern"];
    previewProgress?: OnboardingPreview["progress"];
}

interface OnboardingWizardProps {
    initialEntry?: OnboardingEntrySnapshot;
}

const OnboardingWizard = ({ initialEntry }: OnboardingWizardProps) => {
    const [state, setState] = useState<WizardState>(() => {
        if (initialEntry) {
            return {
                step: 3,
                maxStep: 3,
                entryId: initialEntry.entryId,
                entryContent: initialEntry.entryContent,
                insightText: initialEntry.insightText,
                insightTags: initialEntry.insightTags,
                previewPattern: initialEntry.preview?.pattern,
                previewProgress: initialEntry.preview?.progress,
            };
        }
        return { step: 1, maxStep: 1 };
    });

    const handleSkip = async () => {
        await skipOnboardingAction();
    };

    const handleEntryReady = (data: {
        entryId: string;
        entryContent: string;
        insightText: string;
        tags: InsightTagType[];
    }) => {
        setState((prev) => ({
            ...prev,
            entryId: data.entryId,
            entryContent: data.entryContent,
            insightText: data.insightText,
            insightTags: data.tags,
        }));
    };

    const handlePreviewReady = (preview: OnboardingPreview) => {
        setState((prev) => ({
            ...prev,
            previewPattern: preview.pattern,
            previewProgress: preview.progress,
        }));
    };

    const handleReflectionContinue = (data: {
        entryId: string;
        entryContent: string;
        insightText: string;
        tags: InsightTagType[];
        preview?: OnboardingPreview;
    }) => {
        setState((prev) => ({
            ...prev,
            step: 3,
            maxStep: Math.max(prev.maxStep, 3) as Step,
            entryId: data.entryId,
            entryContent: data.entryContent,
            insightText: data.insightText,
            insightTags: data.tags,
            // Only overwrite preview if we actually received new data —
            // prevents undefined from clobbering what onPreviewReady already set
            ...(data.preview && {
                previewPattern: data.preview.pattern,
                previewProgress: data.preview.progress,
            }),
        }));
    };

    const goToStep = (step: Step) => {
        setState((prev) => ({
            ...prev,
            step,
            maxStep: Math.max(prev.maxStep, step) as Step,
        }));
    };

    const handleComplete = async () => {
        await completeOnboardingAction();
    };

    return (
        <div className="relative min-h-svh flex flex-col items-center">
            {/* Skip button — top right (not on completion screen) */}
            {state.step !== 5 && (
                <button
                    type="button"
                    onClick={handleSkip}
                    className="absolute top-6 right-8 text-md text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                    Skip Onboarding
                </button>
            )}

            {/* Step content */}
            <div className="w-full px-8 flex-1 flex flex-col items-center justify-center">
                {/* Progress indicator */}
                <div className="mb-24">
                    <OnboardingProgress
                        currentStep={state.step}
                        onBack={
                            state.step > 1
                                ? () => goToStep((state.step - 1) as Step)
                                : undefined
                        }
                        onForward={
                            state.step < state.maxStep
                                ? () => goToStep((state.step + 1) as Step)
                                : undefined
                        }
                    />
                </div>
                {state.step === 1 && (
                    <WelcomeStep
                        onStart={() => goToStep(2)}
                        onSkip={handleSkip}
                    />
                )}

                {state.step === 2 && (
                    <ReflectionStep
                        onContinue={handleReflectionContinue}
                        onSkip={() => goToStep(3)}
                        onEntryReady={handleEntryReady}
                        onPreviewReady={handlePreviewReady}
                        initialEntryId={state.entryId}
                        initialContent={state.entryContent}
                        initialInsight={
                            state.insightText && state.insightTags
                                ? {
                                      text: state.insightText,
                                      tags: state.insightTags,
                                  }
                                : undefined
                        }
                        initialPreview={
                            state.previewPattern && state.previewProgress
                                ? {
                                      pattern: state.previewPattern,
                                      progress: state.previewProgress,
                                  }
                                : undefined
                        }
                    />
                )}

                {state.step === 3 && (
                    <PatternsStep
                        previewPattern={state.previewPattern}
                        entryId={state.entryId}
                        onContinue={() => goToStep(4)}
                    />
                )}

                {state.step === 4 && (
                    <ProgressStep
                        previewProgress={state.previewProgress}
                        hasEntry={!!state.entryId}
                        onContinue={() => goToStep(5)}
                    />
                )}

                {state.step === 5 && (
                    <CompletionStep onComplete={handleComplete} />
                )}
            </div>
        </div>
    );
};

export { OnboardingWizard };
