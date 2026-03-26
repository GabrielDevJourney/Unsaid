import Link from "next/link";
import { Button } from "@/components/ui/button";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "#";

const EntryGate = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center px-10 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                15 entries in
            </p>
            <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                You've started something real.
            </h1>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                Your patterns are forming. Your progress is visible. To keep
                writing — and keep uncovering what's underneath — you'll need
                Pro.
            </p>
            <div className="flex flex-col items-center gap-4">
                <Button asChild variant="sunrise" size="sm">
                    <Link href={CHECKOUT_URL}>Unlock Pro — $10.99/mo</Link>
                </Button>
                <div className="flex gap-6">
                    <Link
                        href="/patterns"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        See your patterns →
                    </Link>
                    <Link
                        href="/progress"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        See your progress →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export { EntryGate };
