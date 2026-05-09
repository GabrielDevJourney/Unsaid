"use client";

import { useCallback, useState } from "react";
import {
    completeOnboardingAction,
    skipOnboardingAction,
} from "@/app/actions/onboarding";
import { savePersonaAction } from "@/app/actions/persona";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import type { OnboardingEntrySnapshot } from "@/lib/onboarding/service";
import type { PersonaRow } from "@/lib/persona/service";
import type { OnboardingPreview } from "@/lib/schemas/onboarding-preview";
import type { PersonaInput } from "@/lib/schemas/persona";
import { OnboardingProgress } from "./onboarding-progress";
import { CompletionStep } from "./steps/completion-step";
import { PatternsStep } from "./steps/patterns-step";
import { PersonaStep } from "./steps/persona-step";
import { ProgressStep } from "./steps/progress-step";
import { ReflectionStep } from "./steps/reflection-step";
import { WelcomeStep } from "./steps/welcome-step";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface WizardState {
    step: Step;
    maxStep: Step;
    personaInnerStep: number;
    personaData?: PersonaInput;
    entryId?: string;
    entryContent?: string;
    insightText?: string;
    insightTags?: InsightTagType[];
    previewPattern?: OnboardingPreview["pattern"];
    previewProgress?: OnboardingPreview["progress"];
}

interface OnboardingWizardProps {
    initialPersona?: PersonaRow | null;
    initialEntry?: OnboardingEntrySnapshot;
    suggestedDisplayName?: string;
}

const rowToPersonaInput = (row: PersonaRow): PersonaInput => ({
    displayName: row.displayName,
    q1Answer: row.q1Answer as PersonaInput["q1Answer"],
    q2Answer: row.q2Answer as PersonaInput["q2Answer"],
    q3Answer: row.q3Answer as PersonaInput["q3Answer"],
    q4Answer: row.q4Answer as PersonaInput["q4Answer"],
});

const getInitialState = (
    initialPersona: PersonaRow | null | undefined,
    initialEntry: OnboardingEntrySnapshot | undefined,
): WizardState => {
    if (initialEntry) {
        return {
            step: 4,
            maxStep: 4,
            personaInnerStep: 5,
            personaData: initialPersona
                ? rowToPersonaInput(initialPersona)
                : undefined,
            entryId: initialEntry.entryId,
            entryContent: initialEntry.entryContent,
            insightText: initialEntry.insightText,
            insightTags: initialEntry.insightTags,
            previewPattern: initialEntry.preview?.pattern,
            previewProgress: initialEntry.preview?.progress,
        };
    }
    if (initialPersona) {
        return {
            step: 3,
            maxStep: 3,
            personaInnerStep: 5,
            personaData: rowToPersonaInput(initialPersona),
        };
    }
    return { step: 1, maxStep: 1, personaInnerStep: 0 };
};

const OnboardingWizard = ({
    initialPersona,
    initialEntry,
    suggestedDisplayName,
}: OnboardingWizardProps) => {
    const [state, setState] = useState<WizardState>(() =>
        getInitialState(initialPersona, initialEntry),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            await skipOnboardingAction();
        } catch {
            setIsSubmitting(false);
        }
    };

    const goToStep = (step: Step) => {
        setState((prev) => ({
            ...prev,
            step,
            maxStep: Math.max(prev.maxStep, step) as Step,
        }));
    };

    const handlePersonaComplete = async (data: PersonaInput) => {
        try {
            await savePersonaAction(data);
        } catch {
            // non-fatal — persona data lives in wizard state, user can continue
        }
        setState((prev) => ({ ...prev, personaData: data }));
        goToStep(3);
    };

    const handlePersonaInnerStepChange = useCallback((innerStep: number) => {
        setState((prev) => ({ ...prev, personaInnerStep: innerStep }));
    }, []);

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
            step: 4,
            maxStep: Math.max(prev.maxStep, 4) as Step,
            entryId: data.entryId,
            entryContent: data.entryContent,
            insightText: data.insightText,
            insightTags: data.tags,
            ...(data.preview && {
                previewPattern: data.preview.pattern,
                previewProgress: data.preview.progress,
            }),
        }));
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await completeOnboardingAction();
        } catch {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-svh relative flex flex-col px-8 pt-16 pb-8">
            {state.step !== 6 && (
                <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="absolute top-6 right-8 text-sm text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Skip
                </button>
            )}

            <div className="flex-1 flex flex-col gap-8">
                <div className="flex justify-center">
                    <OnboardingProgress
                        currentStep={state.step}
                        personaInnerStep={
                            state.step === 2
                                ? state.personaInnerStep
                                : undefined
                        }
                        onBack={
                            state.step > 2
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

                <div className="flex-1 flex items-center justify-center">
                    {state.step === 1 && (
                        <WelcomeStep
                            onStart={() => goToStep(2)}
                            onSkip={handleSkip}
                        />
                    )}

                    {state.step === 2 && (
                        <PersonaStep
                            onComplete={handlePersonaComplete}
                            onInnerStepChange={handlePersonaInnerStepChange}
                            initialData={state.personaData}
                            suggestedDisplayName={suggestedDisplayName}
                        />
                    )}

                    {state.step === 3 && (
                        <ReflectionStep
                            onContinue={handleReflectionContinue}
                            onSkip={() => goToStep(4)}
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

                    {state.step === 4 && (
                        <PatternsStep
                            previewPattern={state.previewPattern}
                            entryId={state.entryId}
                            onContinue={() => goToStep(5)}
                        />
                    )}

                    {state.step === 5 && (
                        <ProgressStep
                            previewProgress={state.previewProgress}
                            hasEntry={!!state.entryId}
                            onContinue={() => goToStep(6)}
                        />
                    )}

                    {state.step === 6 && (
                        <CompletionStep onComplete={handleComplete} />
                    )}
                </div>
            </div>
        </div>
    );
};

export { OnboardingWizard };
