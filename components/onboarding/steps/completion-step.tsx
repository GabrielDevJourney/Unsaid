"use client";

import { Button } from "@/components/ui/button";

interface CompletionStepProps {
    onComplete: () => void;
}

const CompletionStep = ({ onComplete }: CompletionStepProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center">
            {/* Illustration placeholder */}
            <div className="w-32 h-32 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                <span className="text-xs text-neutral-400">Illustration</span>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="font-serif text-5xl italic text-neutral-500">
                    Your mind temple has its first stone
                </h1>
                <p className="text-zinc-500">
                    Every entry you write adds depth. Every insight reveals a
                    new layer.
                    <br />
                    Block by block, you&apos;ll build a place to understand
                    yourself.
                </p>
            </div>

            <Button variant="sunrise" size="sm" onClick={onComplete}>
                Enter your mind temple
            </Button>
        </div>
    );
};

export { CompletionStep };
