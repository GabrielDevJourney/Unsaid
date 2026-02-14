"use client";

import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const SignInPage = () => {
    return (
        <div className="flex min-h-svh">
            {/* Left — form */}
            <div className="flex flex-1 flex-col items-center justify-center bg-primary-foreground px-8">
                {/* Logo placeholder */}
                <div className="mb-8 h-12 w-12 rounded-md bg-muted" />

                <ClerkLoading>
                    <div className="flex w-full max-w-md h-97.5 flex-col gap-4 rounded-xl border border-muted p-8">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                    </div>
                </ClerkLoading>

                <ClerkLoaded>
                    <div className="min-h-97.5">
                        <SignIn
                            appearance={{
                                layout: {
                                    socialButtonsPlacement: "bottom",
                                },
                                variables: {
                                    colorPrimary: "#171717",
                                    colorText: "#171717",
                                    colorTextSecondary: "#737373",
                                    colorBackground: "#FAFAFA",
                                    colorInputBackground: "#E5E5E5",
                                    colorInputText: "#171717",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                },
                            }}
                        />
                    </div>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <a href="/sign-up" className="underline">
                            Sign up
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

            {/* Right — illustration placeholder */}
            <div className="hidden flex-1 items-center justify-center bg-neutral-800 lg:flex">
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-neutral-600">
                    <span className="text-4xl text-neutral-400">&#x1F5BC;</span>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
