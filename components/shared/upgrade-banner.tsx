"use client";

const _CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "#";

const ROW = "flex items-center justify-between border-b px-10 py-2";
const TEXT = "text-xs";
const CTA = "text-xs font-medium";

const UpgradeBanner = () => {
    return (
        <>
            {/* 5 — Cool slate blue (from paused subscription, calm) */}
            <div
                className={ROW}
                style={{ backgroundColor: "#EEF4FA", borderColor: "#B8D0E8" }}
            >
                <p className={TEXT} style={{ color: "#2E5C7A" }}>
                    Patterns are forming in your writing.
                </p>
                <span className={CTA} style={{ color: "#2E5C7A" }}>
                    → Unlock Pro — $10.99/mo
                </span>
            </div>

            {/* 7 — Warm white, near-invisible (copy does all the work) */}
            <div
                className={ROW}
                style={{ backgroundColor: "#FAFAFA", borderColor: "#E4E4E7" }}
            >
                <p className={TEXT} style={{ color: "#18181B" }}>
                    Patterns are forming in your writing.
                </p>
                <span className={CTA} style={{ color: "#71717A" }}>
                    → Unlock Pro — $10.99/mo
                </span>
            </div>

            {/* 9 — Soft teal (fresh, calm) */}
            <div
                className={ROW}
                style={{ backgroundColor: "#F0FAFA", borderColor: "#B0D8D8" }}
            >
                <p className={TEXT} style={{ color: "#2A6060" }}>
                    Patterns are forming in your writing.
                </p>
                <span className={CTA} style={{ color: "#2A6060" }}>
                    → Unlock Pro — $10.99/mo
                </span>
            </div>
        </>
    );
};

export { UpgradeBanner };
