import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UpgradePricingSectionProps {
    checkoutUrl: string;
}

const UpgradePricingSection = ({ checkoutUrl }: UpgradePricingSectionProps) => (
    <>
        <div className="my-10 border-t border-border" />

        <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full max-w-md">
                <div className="flex-1 rounded-xl border border-neutral-200 bg-card px-5 py-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Monthly
                    </p>
                    <p className="font-serif text-3xl italic text-neutral-500">
                        $10.99
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <div className="relative flex-1 rounded-xl border border-transparent bg-card px-5 py-4 [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]">
                    <span className="absolute -top-2.5 right-3 rounded-full bg-slate-200 border border-slate-400 px-2 py-0.5 text-xs text-slate-500">
                        Save 25%
                    </span>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Yearly
                    </p>
                    <p className="font-serif text-3xl italic text-neutral-500">
                        $99
                    </p>
                    <p className="text-sm text-muted-foreground">
                        $8.25/mo, billed annually
                    </p>
                </div>
            </div>
            <Button
                asChild
                variant="sunrise"
                className="w-full max-w-md font-bold"
            >
                <Link href={checkoutUrl}>Continue with Pro</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
                Cancel anytime. Your entries are always yours.
            </p>
        </div>
    </>
);

export { UpgradePricingSection, type UpgradePricingSectionProps };
