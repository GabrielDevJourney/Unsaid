"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

const markOnboardingComplete = async (): Promise<void> => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    const { error } = await supabase
        .from("user_progress")
        .update({ has_completed_onboarding: true })
        .eq("user_id", userId);

    if (error)
        throw new Error(`Failed to complete onboarding: ${error.message}`);
};

export const completeOnboardingAction = async (): Promise<void> => {
    await markOnboardingComplete();
    redirect("/home");
};

export const skipOnboardingAction = async (): Promise<void> => {
    await markOnboardingComplete();
    redirect("/home");
};
