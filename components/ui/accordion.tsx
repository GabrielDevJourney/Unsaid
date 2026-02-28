"use client";

import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Accordion({
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn("border-b", className)}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    iconSide = "right",
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
    iconSide?: "left" | "right";
}) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    "focus-visible:border-ring focus-visible:ring-ring/50 flex items-start gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                    iconSide === "right" &&
                        "flex-1 justify-between hover:underline [&[data-state=open]>svg]:rotate-180",
                    iconSide === "left" && "group w-full items-center",
                    className,
                )}
                {...props}
            >
                {iconSide === "left" && (
                    <>
                        <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="text-muted-foreground pointer-events-none size-5 h-full shrink-0 group-data-[state=open]:hidden"
                        />
                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className="text-muted-foreground pointer-events-none hidden size-5 h-full shrink-0 group-data-[state=open]:block"
                        />
                    </>
                )}
                {children}
                {iconSide === "right" && (
                    <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200"
                    />
                )}
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
            {...props}
        >
            <div className={cn("pt-0 pb-4", className)}>{children}</div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
