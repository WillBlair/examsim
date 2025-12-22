import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamSim - Practice Exams Made Easy",
  description: "Turn your course materials into full-scale practice exams",
  icons: {
    icon: "/images/examsimlogogreen-removebg-preview.png",
    apple: "/images/examsimlogogreen-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
