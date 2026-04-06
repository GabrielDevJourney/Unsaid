import { cn } from "@/lib/utils";

interface FoggyBlurOverlayProps {
    className?: string;
}

const FoggyBlurOverlay = ({ className }: FoggyBlurOverlayProps) => (
    <div
        className={cn(
            "absolute inset-x-0 bottom-0 h-12 pointer-events-none",
            className,
        )}
        style={{
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "linear-gradient(to bottom, transparent, black 50%)",
            WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 40%)",
        }}
    />
);

export { FoggyBlurOverlay };
