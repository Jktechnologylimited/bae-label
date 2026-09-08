"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Ticket as TicketIcon,
  Users,
  ExternalLink,
  Mic2,
  Disc3,
  Newspaper,
  Settings,
  BookOpen,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import clsx from "clsx";
import BaeMark from "@/components/brand/BaeMark";
import LogoutButton from "@/components/auth/LogoutButton";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/artists", label: "Artists", icon: Mic2 },
  { href: "/admin/releases", label: "Releases", icon: Disc3 },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/tickets", label: "Tickets", icon: TicketIcon },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/docs", label: "Documentation", icon: BookOpen },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-ink-elevated text-paper" : "text-paper/85 hover:bg-ink-elevated"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ userEmail }: { userEmail: string }) {
  return (
    <div className="border-t border-line px-3 py-4">
      <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper">
        <ExternalLink className="size-3.5" /> View Site
      </Link>
      <div className="mt-1 px-3 py-2.5">
        <p className="truncate text-xs text-muted">{userEmail}</p>
        <LogoutButton className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper" />
      </div>
    </div>
  );
}

export default function AdminShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Derived-state-during-render: close the drawer the moment the route
  // changes, without an effect firing setState after paint (same pattern
  // used for the main site's mobile nav in components/layout/Header.tsx).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (drawerOpen) setDrawerOpen(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] bg-ink text-paper">
      {/* Persistent sidebar — visible from the lg breakpoint up */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-ink-soft lg:flex">
        <div className="flex items-center gap-2 border-b border-line px-5 py-5">
          <BaeMark size={30} className="text-paper" />
          <p className="font-display text-sm font-black uppercase leading-none">BAE Admin</p>
        </div>
        <NavLinks pathname={pathname} />
        <SidebarFooter userEmail={userEmail} />
      </aside>

      {/* Off-canvas drawer — below lg, toggled from the top bar */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[70] bg-black/70 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-[80] flex w-72 flex-col border-r border-line bg-ink-soft lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-5">
                <div className="flex items-center gap-2">
                  <BaeMark size={28} className="text-paper" />
                  <p className="font-display text-sm font-black uppercase leading-none">BAE Admin</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="text-paper/70 hover:text-paper"
                >
                  <PanelLeftClose className="size-5" />
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
              <SidebarFooter userEmail={userEmail} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — below lg only; the panel icon opens/closes the drawer,
            same affordance Claude's own UI uses for its sidebar rather than
            a hamburger/X pair. */}
        <div className="flex items-center gap-3 border-b border-line bg-ink-soft px-4 py-3 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="text-paper/80 hover:text-paper"
          >
            <PanelLeftOpen className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <BaeMark size={24} className="text-paper" />
            <p className="font-display text-sm font-black uppercase leading-none">BAE Admin</p>
          </div>
        </div>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
