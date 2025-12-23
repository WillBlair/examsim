import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ExamSim - Practice Exams Made Easy",
  description: "Turn your course materials into full-scale practice exams",
  icons: {
    icon: "/images/examsimlogogreen-compressed.webp",
    apple: "/images/examsimlogogreen-compressed.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload LCP image for faster rendering */}
        <link
          rel="preload"
          href="/images/compressed-dashboard-preview.webp"
          as="image"
          type="image/webp"
        />
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors expand={true} />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
