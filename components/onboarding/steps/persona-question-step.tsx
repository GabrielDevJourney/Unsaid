"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PersonaQuestionStepProps {
    question: string;
    options: readonly { key: string; label: string }[];
    onConfirm: (key: string) => void;
    isLastStep?: boolean;
    defaultSelected?: string;
}

const PersonaQuestionStep = ({
    question,
    options,
    onConfirm,
    isLastStep = false,
    defaultSelected,
}: PersonaQuestionStepProps) => {
    const [selected, setSelected] = useState<string | null>(
        defaultSelected ?? null,
    );

    return (
        <div className="flex flex-col gap-6">
            <p className="font-serif italic text-4xl text-neutral-500 leading-snug">
                {question}
            </p>
            <div className="flex flex-col gap-2">
                {options.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelected(option.key)}
                        className={cn(
                            "w-full text-left px-5 py-4 rounded-xl transition-all text-sm text-zinc-600 cursor-pointer",
                            selected === option.key
                                ? "border-2 border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]"
                                : "border-2 border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <Button
                variant="sunrise"
                disabled={!selected}
                onClick={() => {
                    if (selected) onConfirm(selected);
                }}
                className="self-center"
            >
                {isLastStep ? "Let's Start" : "Continue"}
            </Button>
        </div>
    );
};

export { PersonaQuestionStep };
