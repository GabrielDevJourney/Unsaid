import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { exportUserData } from "@/lib/exports/service";
import { createSupabaseServer } from "@/lib/supabase/server";

export const GET = async () => {
    const { userId } = await auth();

    if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const supabase = await createSupabaseServer();
        const { content, skippedBatchCount } = await exportUserData(
            supabase,
            userId,
        );

        const today = new Date().toISOString().split("T")[0];
        const headers = new Headers({
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="unsaid-journal-${today}.md"`,
        });

        if (skippedBatchCount > 0) {
            headers.set("X-Export-Warnings", String(skippedBatchCount));
        }

        return new Response(content, { headers });
    } catch (err) {
        Sentry.captureException(err);
        console.error(
            "[export] Unexpected error:",
            err instanceof Error ? err.message : "unknown",
        );
        return new Response(JSON.stringify({ error: "Export failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
