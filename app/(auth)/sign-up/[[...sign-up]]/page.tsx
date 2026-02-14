"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const SignUpPage = () => {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-primary-foreground px-4">
            {/* Logo placeholder */}
            <div className="mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-sidebar-primary" />
                <span className="text-lg font-medium">Unsaid</span>
            </div>

            <ClerkLoading>
                <div className="flex w-full max-w-md h-163 flex-col gap-4 rounded-xl border border-muted p-8">
                    <Skeleton className="mx-auto h-10 w-3/4" />
                    <Skeleton className="mx-auto h-4 w-2/3" />
                    <div className="flex gap-3">
                        <Skeleton className="h-11 flex-1 rounded-lg" />
                        <Skeleton className="h-11 flex-1 rounded-lg" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-3">
                        <Skeleton className="h-11 flex-1 rounded-lg" />
                        <Skeleton className="h-11 flex-1 rounded-lg" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </ClerkLoading>

            <ClerkLoaded>
                <div className="min-h-162.5" id="sign-up">
                    <SignUp
                        appearance={{
                            layout: {
                                socialButtonsPlacement: "bottom",
                            },
                            variables: {
                                colorPrimary: "#171717",
                                colorText: "#171717",
                                colorTextSecondary: "#737373",
                                colorBackground: "#F2F2F2",
                                colorInputBackground: "#E5E5E5",
                                colorInputText: "#171717",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                            },
                        }}
                    />
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a href="/sign-in" className="underline">
                        Sign in
                    </a>
                </p>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By clicking continue, you agree to our{" "}
                    <a href={" "} className="underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href={" "} className="underline">
                        Privacy Policy
                    </a>
                    .
                </p>
            </ClerkLoaded>
        </div>
    );
};

export default SignUpPage;
