import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddleware } from "./lib/supabase/middleware";

const BOT_PROBE_PATTERNS =
    /^\/(\.env|\.git|\.aws|\.docker|config\/|wp-|admin|phpmy|cgi-bin|\.well-known\/security)/i;

const isDashboardRoute = createRouteMatcher([
    "/home(.*)",
    "/entries(.*)",
    "/patterns(.*)",
    "/progress(.*)",
    "/settings(.*)",
    "/feedback(.*)",
    "/backstage(.*)",
    "/onboarding(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isBackstageRoute = createRouteMatcher(["/backstage(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname;

    if (BOT_PROBE_PATTERNS.test(pathname)) {
        return new NextResponse(null, { status: 404 });
    }

    const { userId } = await auth();

    // Not signed in → redirect dashboard routes to sign-in, pass everything else through
    if (!userId) {
        if (isDashboardRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        return NextResponse.next();
    }

    const supabase = await createSupabaseMiddleware();

    // Fetch role alongside user_id — used for both provisioning check and admin gate
    const { data: user } = await supabase
        .from("users")
        .select("user_id, role")
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
                    "Content-Type": "text/html; charset=utf-8",
                    "Retry-After": "2",
                },
            },
        );
    }

    // Backstage is admin-only — block non-admins at the middleware level
    if (isBackstageRoute(req) && user.role !== "admin") {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    // Redirect new users to onboarding (only for dashboard routes, not onboarding itself)
    if (isDashboardRoute(req) && !isOnboardingRoute(req)) {
        const { data: progress } = await supabase
            .from("user_progress")
            .select("has_completed_onboarding")
            .eq("user_id", userId)
            .single();

        if (progress && !progress.has_completed_onboarding) {
            return NextResponse.redirect(new URL("/onboarding", req.url));
        }
    }

    // Pass user role to Server Components via request header — avoids a redundant DB
    // query in the dashboard layout which needs to know if the user is an admin
    const requestHeaders = new Headers(req.headers);
    // Strip any client-supplied role before writing the trusted DB value
    requestHeaders.delete("x-user-role");
    requestHeaders.set("x-user-role", user.role ?? "");
    return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
    matcher: [
        //Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
