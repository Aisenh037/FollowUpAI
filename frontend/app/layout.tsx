import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

import * as Sentry from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "FollowUpAI - AI Sales Follow-Up Agent",
    description: "Autonomous AI agent for sales follow-up and pipeline recovery",
    other: {
        ...Sentry.getTraceData(),
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${outfit.variable} ${inter.variable} font-sans antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
