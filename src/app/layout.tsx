import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARRC — African Royal Rainbow Congress | New Generation, New Direction",
  description:
    "The African Royal Rainbow Congress (ARRC) — The People's Voice, South Africa's Strength. Join the movement for transparency, justice, progress, and unity. Membership R20/year.",
  keywords: [
    "ARRC",
    "African Royal Rainbow Congress",
    "South Africa",
    "political party",
    "democracy",
    "people's voice",
    "new direction",
    "membership",
    "Thabiso Mabetwa",
    "Tidimalo Tsatsi",
  ],
  authors: [{ name: "African Royal Rainbow Congress" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "ARRC — African Royal Rainbow Congress",
    description:
      "The People's Voice, South Africa's Strength. Join the movement for a new direction.",
    siteName: "African Royal Rainbow Congress",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARRC — African Royal Rainbow Congress",
    description:
      "The People's Voice, South Africa's Strength. New Generation, New Direction.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "African Royal Rainbow Congress",
              alternateName: "ARRC",
              description:
                "South African political party — The People's Voice, South Africa's Strength",
              foundingDate: "2024",
              founder: [
                { "@type": "Person", name: "Hon. Thabiso Mabetwa" },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
