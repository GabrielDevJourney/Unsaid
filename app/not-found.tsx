import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background] px-4">
            <div className="flex flex-col items-center text-center">
                <span className="select-none font-serif text-[180px] italic leading-none text-neutral-500">
                    404
                </span>

                <h1 className="mt-8 font-serif text-4xl italic text-zinc-600">
                    Well, this is awkward
                </h1>

                <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
                    Not all patterns lead somewhere meaningful. Some paths
                    just&hellip; don&apos;t exist. Let&apos;s get you back to
                    your journey.
                </p>

                <Button asChild variant="sunrise" className="mt-10">
                    <Link href="/">
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            className="size-5 text-white"
                        />
                        <span className="text-sm font-medium text-white">
                            Find Your Way Back
                        </span>
                    </Link>
                </Button>
            </div>
        </main>
    );
};

export default NotFoundPage;
