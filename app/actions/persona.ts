"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { savePersona } from "@/lib/persona/service";
import { type PersonaInput, personaInputSchema } from "@/lib/schemas/persona";
import { createSupabaseServer } from "@/lib/supabase/server";

export const savePersonaAction = async (
    input: PersonaInput,
): Promise<{ error?: string }> => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const validated = personaInputSchema.safeParse(input);
    if (!validated.success) {
        return { error: validated.error.issues[0]?.message ?? "Invalid data" };
    }

    const supabase = await createSupabaseServer();
    const result = await savePersona(supabase, userId, validated.data);

    if (result.error) {
        return { error: result.error };
    }

    return {};
};
