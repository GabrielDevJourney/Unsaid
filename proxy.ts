import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddleware } from "./lib/supabase/middleware";

const BOT_PROBE_PATTERNS =
    /^\/(\.env|\.git|\.aws|\.docker|config\/|wp-|admin|phpmy|cgi-bin|\.well-known\/security)/i;

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname;

    if (BOT_PROBE_PATTERNS.test(pathname)) {
        return new NextResponse(null, { status: 404 });
    }

    const { userId } = await auth();

    // Not signed in → let Clerk handle it
    if (!userId) {
        return NextResponse.next();
    }

    const supabase = await createSupabaseMiddleware();

    const { data: user } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    // Signed in but not yet provisioned (webhook race condition)
    if (!user) {
        if (req.nextUrl.pathname.startsWith("/api")) {
            return NextResponse.json(
                { error: "User provisioning in progress" },
                { status: 409, headers: { "Retry-After": "2" } },
            );
        }

        return new NextResponse(
            '<html><head><meta http-equiv="refresh" content="2"></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#666">Setting up your account…</body></html>',
            {
                status: 503,
                headers: {
                    "Content-Type": "text/html",
                    "Retry-After": "2",
                },
            },
        );
    }

    // User is authenticated + provisioned
    return NextResponse.next();
});

export const config = {
    matcher: [
        //Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
