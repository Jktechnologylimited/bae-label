"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ChevronDown, User } from "lucide-react";
import clsx from "clsx";
import AnnouncementBar from "./AnnouncementBar";
import BaeMark from "@/components/brand/BaeMark";
import Button from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/nav";
import { LABELS } from "@/lib/data";
import { LABEL_CLASSES } from "@/lib/labelStyle";
import { SafeUser } from "@/lib/db/schema";

export default function Header({ user }: { user: SafeUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Derived-state-during-render: close any open overlays the moment the
  // route changes, without needing an effect that fires setState after paint.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (searchOpen) setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isStandaloneRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify");
  if (isStandaloneRoute) return null;

  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar />
      <header className="border-b border-line-soft bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <BaeMark size={40} className="text-paper" />
            <div className="leading-none">
              <p className="font-display text-xl font-black uppercase tracking-tight">BAE</p>
              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
                Three Labels. One Vision.
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 xl:flex">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "relative py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors",
                    active ? "text-paper" : "text-muted hover:text-paper"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gold"
                    />
                  )}
                </Link>
              );
            })}

            {/* Labels dropdown */}
            <div className="relative" onMouseEnter={() => setLabelsOpen(true)} onMouseLeave={() => setLabelsOpen(false)}>
              <button
                className="flex items-center gap-1 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:text-paper"
                aria-expanded={labelsOpen}
              >
                Labels
                <ChevronDown className={clsx("size-3 transition-transform", labelsOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {labelsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full w-64 border border-line bg-ink-soft p-2 shadow-2xl"
                  >
                    {LABELS.map((label) => (
                      <Link
                        key={label.slug}
                        href={`/artists?label=${label.slug}`}
                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper/90 transition-colors hover:bg-ink-elevated"
                      >
                        <span className={clsx("size-2 rounded-full", LABEL_CLASSES[label.slug].bg)} />
                        {label.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
                className="flex size-9 items-center justify-center text-paper transition-colors hover:text-gold"
              >
                <Search className="size-4" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 260 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute right-0 top-full mt-2 overflow-hidden border border-line bg-ink-soft"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search artists, releases…"
                      className="w-[260px] bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button href="/tickets" variant="gold" icon="ticket" className="ml-2 hidden sm:inline-flex">
              Get Tickets
            </Button>

            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
              className="ml-1 hidden items-center gap-1.5 px-2 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:text-gold sm:flex"
            >
              <User className="size-4" />
              {user ? (user.role === "admin" ? "Admin" : "Account") : "Sign In"}
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ml-2 flex size-9 items-center justify-center text-paper xl:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/70 xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[85%] max-w-sm flex-col bg-ink-soft xl:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <BaeMark size={34} className="text-paper" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-paper">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-line-soft py-3.5 font-display text-lg font-bold uppercase tracking-tight text-paper"
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Labels</p>
                {LABELS.map((label) => (
                  <Link
                    key={label.slug}
                    href={`/artists?label=${label.slug}`}
                    className="flex items-center gap-3 border-b border-line-soft py-3 text-sm font-semibold uppercase tracking-[0.06em] text-paper/90"
                  >
                    <span className={clsx("size-2 rounded-full", LABEL_CLASSES[label.slug].bg)} />
                    {label.name}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-line p-6 space-y-3">
                <Link
                  href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
                  className="flex items-center justify-center gap-1.5 border border-line py-3 text-xs font-semibold uppercase tracking-[0.1em] text-paper"
                >
                  <User className="size-4" />
                  {user ? (user.role === "admin" ? "Admin Dashboard" : "My Account") : "Sign In"}
                </Link>
                <Button href="/tickets" variant="gold" icon="ticket" className="w-full">
                  Get Tickets
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
