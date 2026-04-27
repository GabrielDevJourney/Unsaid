import type { EmailAddressJSON } from "@clerk/backend";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { cancelLemonSubscription } from "@/lib/subscriptions/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
    createUserWithProgress,
    deleteUser,
    updateUserProfile,
} from "@/lib/users/service";
import type { CreateWithProgressPayload } from "@/types";

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

                const username = evt.data.username;
                if (!username) {
                    console.error("No username found for user:", clerkId);
                    return new Response("Missing username", { status: 400 });
                }

                const user: CreateWithProgressPayload = {
                    id: clerkId,
                    email,
                    username,
                };

                await createUserWithProgress(supabaseAdmin, user);
                break;
            }

            case "user.updated": {
                const email = evt.data.email_addresses?.find(
                    (e: EmailAddressJSON) =>
                        e.id === evt.data.primary_email_address_id,
                )?.email_address;

                const username = evt.data.username ?? undefined;

                await updateUserProfile(supabaseAdmin, clerkId, {
                    email,
                    username,
                });
                break;
            }

            case "user.deleted": {
                // Attempt LS cancellation as a safety net (e.g. admin-deleted from Clerk dashboard).
                // For user-initiated deletions via the settings page, LS is cancelled before
                // Clerk deletion — so this will usually be a no-op (404/422 from LS).
                const { error: cancelError } = await cancelLemonSubscription(
                    supabaseAdmin,
                    clerkId,
                );

                if (cancelError) {
                    console.error(
                        `LS cancel failed for ${clerkId} during account deletion:`,
                        cancelError,
                    );
                    // Still proceed — user is already gone from Clerk, DB must be cleaned up.
                }

                await deleteUser(supabaseAdmin, clerkId);
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
