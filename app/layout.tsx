import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trekr.vercel.app"),
  title: "Trekr — Track every application. Land what's next.",
  description:
    "Track every application, interview, and offer. Stay organised, stay ahead.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Trekr — Track every application. Land what's next.",
    description: "Track every application, interview, and offer. Stay organised, stay ahead.",
    type: "website",
    siteName: "Trekr",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trekr — Track every application. Land what's next.",
    description: "Track every application, interview, and offer. Stay organised, stay ahead.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <body className="bg-background text-foreground antialiased">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
