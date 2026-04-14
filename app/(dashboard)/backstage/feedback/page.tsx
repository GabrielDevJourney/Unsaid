import { FeedbackAdminView } from "@/components/admin/feedback-admin-view";
import {
    listApprovedFeedbackAdmin,
    listPendingFeedback,
} from "@/lib/feedback/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const AdminFeedbackPage = async () => {
    const supabase = await createSupabaseServer();

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
