import type { Metadata } from "next";

/**
 * signup/page.tsx is a client component and so cannot export metadata itself;
 * this layout exists to keep the page out of search results (robots.ts also
 * disallows the path).
 */
export const metadata: Metadata = {
  title: "Sign Up",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
