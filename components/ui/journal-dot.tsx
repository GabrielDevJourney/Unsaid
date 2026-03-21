import { forwardRef } from "react";

const JournalDot = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
>((props, ref) => (
    <div
        ref={ref}
        {...props}
        className="relative size-5 shrink-0 rounded-full border-[3px] border-zinc-300 bg-neutral-500"
    />
));
JournalDot.displayName = "JournalDot";

export { JournalDot };
