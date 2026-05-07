"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    type PersonaInput,
    Q1_LABEL_MAP,
    Q1_OPTIONS,
    Q1_QUESTION,
    Q2_LABEL_MAP,
    Q2_OPTIONS,
    Q2_QUESTION,
    Q3_LABEL_MAP,
    Q3_OPTIONS,
    Q3_QUESTION,
    Q4_OPTIONS,
    Q4_QUESTION,
} from "@/lib/schemas/persona";
import { PersonaQuestionStep } from "./persona-question-step";

interface PersonaStepProps {
    onComplete: (data: PersonaInput) => void;
    onInnerStepChange: (step: number) => void;
    initialData?: PersonaInput;
}

type InnerStep = 1 | 2 | 3 | 4 | 5;

const SLIDE = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
    transition: { duration: 0.18 },
};

const PersonaStep = ({
    onComplete,
    onInnerStepChange,
    initialData,
}: PersonaStepProps) => {
    const [innerStep, setInnerStep] = useState<InnerStep>(initialData ? 5 : 1);
    const [showOverview, setShowOverview] = useState(!!initialData);
    const [editMode, setEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(
        initialData?.displayName ?? "",
    );
    const [q1Answer, setQ1Answer] = useState(initialData?.q1Answer ?? "");
    const [q2Answer, setQ2Answer] = useState(initialData?.q2Answer ?? "");
    const [q3Answer, setQ3Answer] = useState(initialData?.q3Answer ?? "");
    const [q4Answer, setQ4Answer] = useState(initialData?.q4Answer ?? "");

    // Pill = answered count (0–5), never decreases since options can't be deselected
    useEffect(() => {
        const count = [
            displayName.trim(),
            q1Answer,
            q2Answer,
            q3Answer,
            q4Answer,
        ].filter(Boolean).length;
        onInnerStepChange(count);
    }, [
        displayName,
        q1Answer,
        q2Answer,
        q3Answer,
        q4Answer,
        onInnerStepChange,
    ]);

    const advanceTo = (step: InnerStep) => {
        setInnerStep(step);
        setShowOverview(false);
    };

    const currentStepAnswered =
        (innerStep === 1 && displayName.trim() !== "") ||
        (innerStep === 2 && q1Answer !== "") ||
        (innerStep === 3 && q2Answer !== "") ||
        (innerStep === 4 && q3Answer !== "");

    const showNextArrow =
        !showOverview && !editMode && innerStep < 5 && currentStepAnswered;

    const handleBackClick = () => {
        if (editMode) {
            setEditMode(false);
            setShowOverview(true);
        } else {
            const prev = (innerStep - 1) as InnerStep;
            setInnerStep(prev);
        }
    };

    const handleNameContinue = () => {
        if (displayName.trim()) advanceTo(2);
    };

    const handleQ4Confirm = (key: string) => {
        setQ4Answer(key);
        if (editMode) {
            setEditMode(false);
        }
        setShowOverview(true);
    };

    const renderOverview = () => {
        const answered: {
            step: InnerStep;
            question: string;
            answer: string;
        }[] = [];
        if (displayName)
            answered.push({
                step: 1,
                question: "Your name",
                answer: displayName,
            });
        if (q1Answer)
            answered.push({
                step: 2,
                question: Q1_QUESTION,
                answer: Q1_LABEL_MAP[q1Answer] ?? q1Answer,
            });
        if (q2Answer)
            answered.push({
                step: 3,
                question: Q2_QUESTION,
                answer: Q2_LABEL_MAP[q2Answer] ?? q2Answer,
            });
        if (q3Answer)
            answered.push({
                step: 4,
                question: Q3_QUESTION,
                answer: Q3_LABEL_MAP[q3Answer] ?? q3Answer,
            });
        if (q4Answer)
            answered.push({
                step: 5,
                question: Q4_QUESTION,
                answer:
                    Q4_OPTIONS.find((o) => o.key === q4Answer)?.label ??
                    q4Answer,
            });

        const allAnswered = !!q4Answer;
        const nextStep: InnerStep = !q1Answer
            ? 2
            : !q2Answer
              ? 3
              : !q3Answer
                ? 4
                : 5;

        return (
            <div className="flex flex-col gap-6">
                <p className="font-serif italic text-4xl text-neutral-500 leading-snug">
                    Here's what you've shared.
                </p>
                <div className="flex flex-col gap-2">
                    {answered.map(({ step, question, answer }) => (
                        <div
                            key={step}
                            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-3.5"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-zinc-400">
                                    {question}
                                </span>
                                <span className="text-sm text-zinc-700">
                                    {answer}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(true);
                                    advanceTo(step);
                                }}
                                className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
                <Button
                    variant="sunrise"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                        if (allAnswered) {
                            onComplete({
                                displayName: displayName.trim(),
                                q1Answer: q1Answer as PersonaInput["q1Answer"],
                                q2Answer: q2Answer as PersonaInput["q2Answer"],
                                q3Answer: q3Answer as PersonaInput["q3Answer"],
                                q4Answer: q4Answer as PersonaInput["q4Answer"],
                            });
                        } else {
                            advanceTo(nextStep);
                        }
                    }}
                >
                    Continue
                </Button>
            </div>
        );
    };

    const animationKey = showOverview ? "overview" : String(innerStep);

    return (
        <div className="w-full max-w-sm flex flex-col gap-4">
            {!showOverview && (
                <div className="flex items-center justify-between">
                    <div className="w-9">
                        {!editMode && innerStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBackClick}
                                className="text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <HugeiconsIcon
                                    icon={ArrowLeft01Icon}
                                    size={18}
                                />
                            </button>
                        )}
                    </div>
                    <div className="w-9 flex justify-end">
                        {showNextArrow && (
                            <button
                                type="button"
                                onClick={() =>
                                    advanceTo((innerStep + 1) as InnerStep)
                                }
                                className="text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={18}
                                />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={animationKey}
                    initial={SLIDE.initial}
                    animate={SLIDE.animate}
                    exit={SLIDE.exit}
                    transition={SLIDE.transition}
                >
                    {showOverview ? (
                        renderOverview()
                    ) : innerStep === 1 ? (
                        <div className="flex flex-col gap-4">
                            <p className="font-serif italic text-4xl text-neutral-500 leading-snug">
                                What should we call you?
                            </p>
                            <p className="text-sm text-zinc-400">
                                Just a few things to know you a little better.
                            </p>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                autoFocus
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleNameContinue()
                                }
                            />
                            <Button
                                variant="sunrise"
                                onClick={handleNameContinue}
                                disabled={!displayName.trim()}
                                className="self-start"
                                size="sm"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : innerStep === 2 ? (
                        <PersonaQuestionStep
                            question={Q1_QUESTION}
                            options={Q1_OPTIONS}
                            defaultSelected={q1Answer || undefined}
                            onConfirm={(key) => {
                                setQ1Answer(key);
                                if (editMode) {
                                    setEditMode(false);
                                    setShowOverview(true);
                                } else {
                                    advanceTo(3);
                                }
                            }}
                        />
                    ) : innerStep === 3 ? (
                        <PersonaQuestionStep
                            question={Q2_QUESTION}
                            options={Q2_OPTIONS}
                            defaultSelected={q2Answer || undefined}
                            onConfirm={(key) => {
                                setQ2Answer(key);
                                if (editMode) {
                                    setEditMode(false);
                                    setShowOverview(true);
                                } else {
                                    advanceTo(4);
                                }
                            }}
                        />
                    ) : innerStep === 4 ? (
                        <PersonaQuestionStep
                            question={Q3_QUESTION}
                            options={Q3_OPTIONS}
                            defaultSelected={q3Answer || undefined}
                            onConfirm={(key) => {
                                setQ3Answer(key);
                                if (editMode) {
                                    setEditMode(false);
                                    setShowOverview(true);
                                } else {
                                    advanceTo(5);
                                }
                            }}
                        />
                    ) : (
                        <PersonaQuestionStep
                            question={Q4_QUESTION}
                            options={Q4_OPTIONS}
                            defaultSelected={q4Answer || undefined}
                            isLastStep={false}
                            onConfirm={handleQ4Confirm}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export { PersonaStep };
