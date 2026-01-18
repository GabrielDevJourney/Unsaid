"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100 };

// Pre-generate grid line coordinates for stable keys
const HORIZONTAL_LINES = Array.from({ length: 26 }, (_, i) => ({
    id: `h-y${i * 20}`,
    y: i * 20,
}));

const VERTICAL_LINES = Array.from({ length: 26 }, (_, i) => ({
    id: `v-x${i * 20}`,
    x: i * 20,
}));

const GridLines = () => (
    <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 520 520"
    >
        {HORIZONTAL_LINES.map((line) => (
            <line
                key={line.id}
                x1="0"
                y1={line.y}
                x2="520"
                y2={line.y}
                stroke="#0A0A0A"
                strokeWidth="0.5"
            />
        ))}
        {VERTICAL_LINES.map((line) => (
            <line
                key={line.id}
                x1={line.x}
                y1="0"
                x2={line.x}
                y2="520"
                stroke="#0A0A0A"
                strokeWidth="0.5"
            />
        ))}
    </svg>
);

const CloseIcon = () => (
    <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

const ClockIcon = () => (
    <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="text-[#0A0A0A]"
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
        />
        <path
            d="M12 6V12L16 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

const EmailIcon = () => (
    <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
    >
        <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
        />
        <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const SendIcon = () => (
    <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white"
    >
        <path
            d="M22 2L11 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M22 2L15 22L11 13L2 9L22 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function ComingSoonPage() {
    const [email, setEmail] = useState("");
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [lensScale, setLensScale] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                setSubmitStatus({
                    type: "error",
                    message: result.error || "Something went wrong",
                });
                return;
            }

            setSubmitStatus({
                type: "success",
                message: result.data.message,
            });
            setEmail("");

            // Auto-close modal after success
            setTimeout(() => {
                setShowWaitlistModal(false);
                setSubmitStatus(null);
            }, 2500);
        } catch {
            setSubmitStatus({
                type: "error",
                message: "Network error. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const lensTransform = `translate(calc(-50% + ${(mousePos.x - 0.5) * 30}px), calc(-50% + ${(mousePos.y - 0.5) * 30}px)) scale(${lensScale})`;

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: mouse tracking for decorative lens effect only
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen overflow-hidden bg-white text-[#0A0A0A] selection:bg-[#0A0A0A]/10"
        >
            <div
                className="pointer-events-none fixed inset-0 z-50"
                style={{
                    backgroundImage: NOISE_SVG,
                    backgroundRepeat: "repeat",
                    opacity: showWaitlistModal ? 0.06 : 0.04,
                    transition: "opacity 0.5s ease",
                    mixBlendMode: "multiply",
                }}
            />

            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: `
            radial-gradient(ellipse 120% 80% at 30% 20%, rgba(255, 200, 150, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 70% 80%, rgba(180, 200, 180, 0.12) 0%, transparent 50%)
          `,
                }}
            />

            <nav className="relative z-10 flex items-center justify-center px-8 py-8 md:px-16 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2, ...SPRING_CONFIG }}
                    className="font-grotesque text-[13px] font-medium uppercase tracking-[0.4em] text-[#0A0A0A]"
                >
                    UNSAID
                </motion.div>
            </nav>

            <main className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-6 pb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                        duration: 1.2,
                        delay: 0.4,
                        type: "spring",
                        stiffness: 80,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        transform: lensTransform,
                        transition:
                            "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                >
                    <div className="relative w-[420px] h-[420px] md:w-[520px] md:h-[520px]">
                        <GridLines />
                        <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full"
                            style={{
                                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 40%),
                  radial-gradient(circle at 70% 70%, rgba(0,0,0,0.05) 0%, transparent 40%),
                  linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(240,240,235,0.4) 50%, rgba(220,220,215,0.3) 100%)
                `,
                                boxShadow: `
                  inset 0 2px 20px rgba(255,255,255,0.5),
                  inset 0 -10px 40px rgba(0,0,0,0.05),
                  0 20px 60px rgba(0,0,0,0.08),
                  0 0 0 1px rgba(0,0,0,0.03)
                `,
                                backdropFilter: "blur(2px)",
                            }}
                        >
                            <div
                                className="absolute inset-4 rounded-full"
                                style={{
                                    background:
                                        "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 60%)",
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="relative z-10 w-full max-w-4xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            duration: 0.8,
                            delay: 0.5,
                            ...SPRING_CONFIG,
                        }}
                        className="font-serif text-[clamp(2.8rem,9vw,7rem)] font-light leading-[0.95] tracking-[-0.02em] text-[#0A0A0A] mb-4"
                    >
                        The truth has
                        <br />
                        <span className="italic">no filter.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            duration: 0.8,
                            delay: 0.6,
                            ...SPRING_CONFIG,
                        }}
                        className="font-mono text-[12px] tracking-[0.02em] text-[#8A8A8A] mb-[340px] md:mb-[420px] max-w-[420px] mx-auto leading-relaxed"
                    >
                        Catch the patterns, understand the shift, and own your
                        evolution across time.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            duration: 0.8,
                            delay: 1.1,
                            ...SPRING_CONFIG,
                        }}
                        onClick={() => setShowWaitlistModal(true)}
                        className="h-[52px] px-10 bg-[#0A0A0A] rounded-lg font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-white transition-all hover:bg-[#1A1A1A] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Join Waitlist
                    </motion.button>
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 z-10 px-8 py-6 md:px-16 lg:px-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isLoaded ? { opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="flex items-center justify-between"
                >
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ABABAB]">
                        © 2025 Unsaid
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ABABAB]">
                        Built for the unflinching
                    </span>
                </motion.div>
            </footer>

            <AnimatePresence>
                {showWaitlistModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm"
                        onClick={() => setShowWaitlistModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{
                                duration: 0.4,
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="relative w-[90%] max-w-[480px] bg-white rounded-2xl p-10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setShowWaitlistModal(false)}
                                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
                                aria-label="Close modal"
                            >
                                <CloseIcon />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#F5F5F0] flex items-center justify-center">
                                    <ClockIcon />
                                </div>
                                <h2 className="font-serif text-[2rem] font-light text-[#0A0A0A] mb-2">
                                    Join the waitlist
                                </h2>
                                <p className="font-mono text-[12px] text-[#6A6A6A] leading-relaxed max-w-[320px] mx-auto">
                                    Be the first to experience Unsaid.
                                    We&apos;ll notify you when we launch.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B0B0]">
                                        <EmailIcon />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        onFocus={() => setLensScale(1.05)}
                                        onBlur={() => setLensScale(1)}
                                        placeholder="you@example.com"
                                        disabled={isSubmitting}
                                        className="w-full h-[56px] pl-12 pr-5 bg-[#F8F8F6] rounded-xl font-mono text-[13px] text-[#0A0A0A] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition-all border border-[#E8E8E6] disabled:opacity-50"
                                        required
                                    />
                                </div>

                                {submitStatus && (
                                    <div
                                        className={`p-3 rounded-lg font-mono text-[12px] text-center ${
                                            submitStatus.type === "success"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-red-50 text-red-700 border border-red-200"
                                        }`}
                                    >
                                        {submitStatus.message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-[56px] bg-[#0A0A0A] rounded-xl font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1A1A1A] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        "Joining..."
                                    ) : (
                                        <>
                                            <SendIcon />
                                            Join the waitlist
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-[#E8E8E6] text-center">
                                <span className="font-mono text-[10px] text-[#ABABAB]">
                                    Terms | Privacy Policy
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=IBM+Plex+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;600&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-grotesque { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
        </div>
    );
}
