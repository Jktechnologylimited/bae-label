"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ChevronDown, MessageCircle, HelpCircle } from "lucide-react";
import clsx from "clsx";
import BaeMark from "@/components/brand/BaeMark";
import { SiteSettings } from "@/lib/db/settings";
import { FAQS } from "@/lib/faqData";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.3c1.4.8 3.1 1.3 4.9 1.3h.1c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3h-.1c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3.3.9.9-3.2-.2-.3c-.9-1.4-1.3-3-1.3-4.6C3.2 7.1 7.2 3.2 12 3.2c2.3 0 4.5.9 6.2 2.6 1.6 1.6 2.6 3.8 2.6 6.2 0 4.8-4 8.3-8.8 8.3z" />
    </svg>
  );
}

export default function WhatsAppWidget({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "faq">("chat");
  const [message, setMessage] = useState("");
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const priorityFaqs = FAQS.filter((f) => f.widgetPriority);
  const otherFaqs = FAQS.filter((f) => !f.widgetPriority);
  const orderedFaqs = [...priorityFaqs, ...otherFaqs];

  // Show a small teaser bubble a few seconds after landing, once, if not
  // already dismissed or opened.
  useEffect(() => {
    if (open || teaserDismissed) return;
    const timer = setTimeout(() => setTeaserVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [open, teaserDismissed]);

  useEffect(() => {
    if (!teaserVisible) return;
    const timer = setTimeout(() => setTeaserVisible(false), 12000);
    return () => clearTimeout(timer);
  }, [teaserVisible]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!settings.whatsappEnabled) return null;

  function openWhatsApp(text: string) {
    const encoded = encodeURIComponent(text || settings.whatsappGreeting);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encoded}`, "_blank", "noopener,noreferrer");
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    openWhatsApp(message.trim());
  }

  function toggleOpen() {
    setOpen((v) => !v);
    setTeaserVisible(false);
    setTeaserDismissed(true);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-[520px] w-[92vw] max-w-[360px] flex-col overflow-hidden border border-line bg-ink-soft shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <BaeMark size={30} className="text-paper" />
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-tight text-paper">BAE Support</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="size-1.5 rounded-full bg-elmayana" />
                    Typically replies in minutes
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-muted hover:text-paper">
                <X className="size-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-line">
              <button
                onClick={() => setTab("chat")}
                className={clsx(
                  "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                  tab === "chat" ? "border-b-2 border-gold text-paper" : "text-muted hover:text-paper"
                )}
              >
                <MessageCircle className="size-3.5" /> Chat
              </button>
              <button
                onClick={() => setTab("faq")}
                className={clsx(
                  "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                  tab === "faq" ? "border-b-2 border-gold text-paper" : "text-muted hover:text-paper"
                )}
              >
                <HelpCircle className="size-3.5" /> FAQ
              </button>
            </div>

            {tab === "chat" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  <div className="max-w-[85%] bg-ink-elevated px-3.5 py-2.5 text-sm text-paper/90">
                    {settings.whatsappGreeting}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {settings.whatsappQuickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => setMessage(reply)}
                        className={clsx(
                          "border px-3 py-1.5 text-left text-xs transition-colors",
                          message === reply
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-line text-paper/80 hover:border-gold hover:text-gold"
                        )}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-line p-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    rows={1}
                    placeholder="Type a message…"
                    className="max-h-24 flex-1 resize-none border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    aria-label="Send on WhatsApp"
                    className="flex size-10 shrink-0 items-center justify-center bg-[#25D366] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
                <p className="border-t border-line-soft px-4 py-2 text-center text-[10px] text-muted">
                  Sending opens WhatsApp with your message pre-filled
                </p>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {orderedFaqs.map((faq, i) => {
                    const isOpen = openFaqIndex === i;
                    return (
                      <div key={faq.q} className="border-b border-line-soft">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="text-xs font-semibold text-paper/90">{faq.q}</span>
                          <ChevronDown
                            className={clsx("size-3.5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-3 text-xs leading-relaxed text-muted">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-line p-3">
                  <button
                    onClick={() => setTab("chat")}
                    className="flex w-full items-center justify-center gap-2 bg-[#25D366] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:opacity-90"
                  >
                    <WhatsAppGlyph className="size-3.5" />
                    Still need help? Chat with us
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teaser bubble */}
      <AnimatePresence>
        {teaserVisible && !open && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="flex max-w-[220px] items-start gap-2 border border-line bg-ink-soft px-3.5 py-3 shadow-xl"
          >
            <p className="flex-1 text-xs text-paper/90">👋 Need help? Chat with us on WhatsApp!</p>
            <button
              onClick={() => {
                setTeaserVisible(false);
                setTeaserDismissed(true);
              }}
              aria-label="Dismiss"
              className="shrink-0 text-muted hover:text-paper"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={toggleOpen}
        aria-label={open ? "Close chat" : "Open WhatsApp chat"}
        className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform hover:scale-105"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <WhatsAppGlyph className="size-7 relative" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
