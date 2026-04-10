import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getOnboardingEntrySnapshot } from "@/lib/onboarding/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const OnboardingPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    const { data: progress } = await supabase
        .from("user_progress")
        .select("has_completed_onboarding")
        .eq("user_id", userId)
        .single();

    if (progress?.has_completed_onboarding) {
        redirect("/home");
    }

    const { data: entrySnapshot } = await getOnboardingEntrySnapshot(supabase);

    return <OnboardingWizard initialEntry={entrySnapshot ?? undefined} />;
};

export default OnboardingPage;
