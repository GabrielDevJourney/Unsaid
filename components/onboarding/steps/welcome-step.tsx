"use client";

import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
    onStart: () => void;
    onSkip: () => void;
}

const WelcomeStep = ({ onStart, onSkip }: WelcomeStepProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center">
            {/* Illustration placeholder */}
            <div className="w-32 h-32 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                <span className="text-xs text-neutral-400">Illustration</span>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="font-serif text-5xl italic text-neutral-500">
                    Welcome to Unsaid
                </h1>
                <p className="text-sm text-zinc-500 max-w-sm">
                    A space for the things you carry but never say out loud.
                    <br />
                    Let&apos;s see what&apos;s between your lines.
                </p>
            </div>

            <div className="flex items-center gap-6">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onSkip}
                    className="bg-neutral-300 font-light rounded-xl"
                >
                    Skip onboarding
                </Button>
                <Button variant="sunrise" size="sm" onClick={onStart}>
                    <span>Let&apos;s start writing</span>
                </Button>
            </div>
        </div>
    );
};

export { WelcomeStep };
