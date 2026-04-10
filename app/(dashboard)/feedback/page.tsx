import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedbackView } from "@/components/feedback/feedback-view";
import { listFeedbackForUser } from "@/lib/feedback/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const FeedbackPage = async () => {
    const authPromise = auth();
    const userPromise = currentUser();
    const supabasePromise = createSupabaseServer();

    const { userId } = await authPromise;
    if (!userId) redirect("/sign-in");

    const [user, supabase] = await Promise.all([userPromise, supabasePromise]);

    const { data: items } = await listFeedbackForUser(supabase, userId);

    return (
        <FeedbackView
            initialItems={items ?? []}
            userFirstName={user?.firstName ?? ""}
            userAvatarUrl={user?.imageUrl ?? null}
        />
    );
};

export default FeedbackPage;
