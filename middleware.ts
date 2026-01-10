import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddleware } from "./lib/supabase/middleware";

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId } = await auth();

    // Not signed in → let Clerk handle it
    if (!userId) {
        return NextResponse.next();
    }

    // Allow provisioning page itself
    if (req.nextUrl.pathname.startsWith("/provisioning")) {
        return NextResponse.next();
    }

    const supabase = await createSupabaseMiddleware();

    const { data: user } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    // Signed in but not yet provisioned
    if (!user) {
        // API routes → JSON
        if (req.nextUrl.pathname.startsWith("/api")) {
            return NextResponse.json(
                { error: "User provisioning in progress" },
                { status: 409 },
            );
        }

        // Pages → redirect
        return NextResponse.redirect(new URL("/provisioning", req.url));
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
