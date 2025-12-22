import type { EmailAddressJSON } from "@clerk/backend";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateWithProgressPayload } from "@/types";
import { createUserWithProgress } from "@/lib/users/service";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);
        const supabaseAdmin = createSupabaseAdmin();
        const { id: clerkId } = evt.data;

        if (!clerkId) {
            return new Response("No user ID provided", { status: 400 });
        }

        switch (evt.type) {
            case "user.created": {
                const email = evt.data.email_addresses?.find(
                    (e: EmailAddressJSON) =>
                        e.id === evt.data.primary_email_address_id,
                )?.email_address;

                if (!email) {
                    console.error("No primary email found for user:", clerkId);
                    return new Response("Missing email", { status: 400 });
                }

                const user: CreateWithProgressPayload = {
                    id: clerkId,
                    email: email,
                };

                await createUserWithProgress(supabaseAdmin, user);

                break;
            }
            case "user.deleted": {
                // await userService.handleDeletion(supabase, clerkId);
                break;
            }

            default:
                console.log(`Unhandled event type: ${evt.type}`);
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}
