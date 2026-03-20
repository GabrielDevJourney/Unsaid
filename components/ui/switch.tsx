"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
    className,
    size = "default",
    variant = "default",
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
    size?: "sm" | "default" | "lg";
    variant?: "default" | "sunrise";
}) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-none outline-none transition-all duration-500 ease-in-out focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                "data-[size=sm]:h-4 data-[size=sm]:w-7",
                "data-[size=default]:h-5 data-[size=default]:w-9",
                "data-[size=lg]:h-8 data-[size=lg]:w-14",
                variant === "sunrise"
                    ? [
                          "bg-gray-300",
                          "data-[state=checked]:bg-[linear-gradient(to_right,rgba(148,163,184,1)_0%,rgba(148,163,184,1)_25%,rgba(189,142,111,1)_75%,rgba(247,107,21,0.6)_100%)]",
                      ]
                    : "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",

                className,
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "pointer-events-none block rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
                    "group-data-[size=default]/switch:size-4",
                    "group-data-[size=sm]/switch:size-3",
                    "group-data-[size=lg]/switch:size-7",
                    "data-[state=unchecked]:translate-x-0.5",
                    "group-data-[size=default]/switch:data-[state=checked]:translate-x-4.5",
                    "group-data-[size=sm]/switch:data-[state=checked]:translate-x-3.5",
                    "group-data-[size=lg]/switch:data-[state=checked]:translate-x-6.5",
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
