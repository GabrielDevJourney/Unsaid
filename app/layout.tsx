import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import localFont from "next/font/local";
import { LemonSqueezyProvider } from "@/components/lemon-squeezy-provider";
import "./globals.css";

const satoshi = localFont({
    src: "../public/fonts/Satoshi-Variable.woff2",
    variable: "--font-satoshi",
    weight: "300 900",
    display: "swap",
});

const libreBaskerville = Libre_Baskerville({
    variable: "--font-libre",
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["italic", "normal"],
});

export const metadata: Metadata = {
    title: "Unsaid",
    description: "AI-powered journaling for self-discovery",
    icons: {
        icon: "/logo-black-bg.svg",
    },
};

const localization = {
    signIn: {
        start: {
            title: "Welcome back",
            subtitle: "Sign in to continue your reflections.",
        },
    },
    signUp: {
        start: {
            title: "Welcome to Unsaid",
            subtitle: "A private space where your words become insight.",
        },
    },
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <ClerkProvider localization={localization}>
            <html lang="en">
                <body
                    className={`${satoshi.variable} ${libreBaskerville.variable} antialiased`}
                >
                    {children}
                    <LemonSqueezyProvider />
                </body>
            </html>
        </ClerkProvider>
    );
};

export default RootLayout;
