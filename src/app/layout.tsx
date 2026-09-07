import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import { getCurrentUser } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/db/schema";

const archivo = localFont({
  src: "../fonts/Archivo-Variable.ttf",
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
});

const inter = localFont({
  src: "../fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "BAE — Three Labels. One Movement.",
    template: "%s — BAE",
  },
  description:
    "BAE is a music label collective uniting BigDripUniverse, AG20 and ElmayanaConcept. Three labels, different sounds, one vision — building the future of music and culture.",
  metadataBase: new URL("https://bae.band"),
  openGraph: {
    title: "BAE — Three Labels. One Movement.",
    description:
      "BigDripUniverse. AG20. ElmayanaConcept. Different sounds. One vision.",
    siteName: "BAE",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const safeUser = user ? toSafeUser(user) : null;

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ink text-paper antialiased">
        <Header user={safeUser} />
        <main className="flex-1">{children}</main>
        <ConditionalChrome>
          <Footer />
        </ConditionalChrome>
      </body>
    </html>
  );
}
