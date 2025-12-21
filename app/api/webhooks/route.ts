import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);
        const supabaseAdmin = createSupabaseAdmin();

        if (evt.type === "user.created") {
            const userId = evt.data.id;

            const email = evt.data.email_addresses?.find(
                (e) => e.id === evt.data.primary_email_address_id,
            )?.email_address;

            if (!email) {
                console.error("No primary email found for user:", userId);
                return new Response("Missing email", { status: 400 });
            }

            const { error: userInsertError } = await supabaseAdmin
                .from("users")
                .insert({
                    user_id: userId,
                    email: "test@email.com",
                    subscription_status: "trial",
                });

            if (userInsertError && userInsertError.code !== "23505") {
                console.error("User insert error:", userInsertError);
                return new Response("Database error", { status: 500 });
            }

            const { error: progressError } = await supabaseAdmin
                .from("user_progress")
                .insert({
                    user_id: userId,
                    total_entries: 0,
                });

            if (progressError) {
                console.error("User progress init error:", progressError);

                // rollback user if progress insert failed
                await supabaseAdmin
                    .from("users")
                    .delete()
                    .eq("user_id", userId);

                return new Response("Database error", { status: 500 });
            }

            console.log("User created + progress initialized:", userId);
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}
