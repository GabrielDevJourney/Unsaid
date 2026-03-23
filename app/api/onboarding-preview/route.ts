import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadPrompt, loadSystemPrompt } from "@/lib/ai/prompts";
import { saveOnboardingPreview } from "@/lib/onboarding/repo";
import {
    onboardingPreviewRequestSchema,
    onboardingPreviewSchema,
} from "@/lib/schemas/onboarding-preview";
import { createSupabaseServer } from "@/lib/supabase/server";

export const POST = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const validated = onboardingPreviewRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const [systemPrompt, taskPrompt] = await Promise.all([
            loadSystemPrompt(),
            loadPrompt("tasks/onboarding-preview.md"),
        ]);

        const promptBase = `${taskPrompt}\n\n---\n\nEntry:\n${validated.data.content}\n\n---\n\nInsight already generated:\n${validated.data.insight}\n\nTags: ${validated.data.tags.join(", ")}`;

        const sharedArgs = {
            model: anthropic("claude-haiku-4-5"),
            system: systemPrompt,
        };

        // Split into two parallel calls — Haiku 4.5 stops after the first
        // top-level key in a multi-field schema, so each call targets one field.
        const [{ object: patternResult }, { object: progressResult }] =
            await Promise.all([
                generateObject({
                    ...sharedArgs,
                    schema: z.object({
                        pattern: onboardingPreviewSchema.shape.pattern,
                    }),
                    prompt: `${promptBase}\n\nGenerate ONLY the "pattern" field.`,
                }),
                generateObject({
                    ...sharedArgs,
                    schema: z.object({
                        progress: onboardingPreviewSchema.shape.progress,
                    }),
                    prompt: `${promptBase}\n\nGenerate ONLY the "progress" field.`,
                }),
            ]);

        const object = {
            pattern: patternResult.pattern,
            progress: progressResult.progress,
        };

        // Persist so the wizard can restore preview on refresh without re-generating
        const supabase = await createSupabaseServer();
        saveOnboardingPreview(
            supabase,
            userId,
            validated.data.entry_id,
            object.pattern,
            object.progress,
        ).catch((err) =>
            console.warn("Failed to save onboarding preview:", err),
        );

        return NextResponse.json({ data: object });
    } catch (error) {
        console.error("Onboarding preview generation failed", error);
        return NextResponse.json(
            { error: "Failed to generate preview" },
            { status: 500 },
        );
    }
};
