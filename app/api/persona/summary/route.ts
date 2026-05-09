import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
    claimPersonaSummary,
    ensureInitialPersonaSummary,
    getPersona,
} from "@/lib/persona/service";
import { createSupabaseServer } from "@/lib/supabase/server";

export const POST = async () => {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServer();
    const { data: persona, error } = await getPersona(supabase, userId);

    if (error || !persona || persona.summary) {
        return NextResponse.json({ data: null });
    }

    await claimPersonaSummary(supabase, userId);
    await ensureInitialPersonaSummary(supabase, persona);

    return NextResponse.json({ data: null });
};
