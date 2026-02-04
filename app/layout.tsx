import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
    variable: "--font-libre",
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["italic"],
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Unsaid",
    description: "AI-powered journaling for self-discovery",
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} antialiased`}
                >
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
};

export default RootLayout;
