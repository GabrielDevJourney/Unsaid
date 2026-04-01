import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedbackAdminView } from "@/components/admin/feedback-admin-view";
import { isAdmin } from "@/lib/auth/admin";
import {
    listApprovedFeedbackAdmin,
    listPendingFeedback,
} from "@/lib/feedback/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const AdminFeedbackPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) redirect("/home");

    const [{ data: pending }, { data: approved }] = await Promise.all([
        listPendingFeedback(supabase),
        listApprovedFeedbackAdmin(supabase),
    ]);

    return (
        <FeedbackAdminView
            initialPending={pending ?? []}
            initialApproved={approved ?? []}
        />
    );
};

export default AdminFeedbackPage;
