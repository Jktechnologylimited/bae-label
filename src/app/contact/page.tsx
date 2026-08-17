import type { Metadata } from "next";
import { Headphones, Mail, MapPin, Phone, Send, ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Accordion from "@/components/ui/Accordion";
import Placeholder from "@/components/ui/Placeholder";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the BAE team — questions, collaborations, partnerships and more.",
};

const REACH = [
  { icon: Mail, title: "Email", lines: ["info@bae.band"], note: "Drop us an email anytime." },
  { icon: Phone, title: "Phone", lines: ["+1 (234) 567-8900"], note: "Mon – Fri, 9AM – 6PM (PT)" },
  { icon: MapPin, title: "Headquarters", lines: ["BAE HQ, Los Angeles, CA", "United States"], note: "By appointment only." },
  { icon: Send, title: "Press & Media Inquiries", lines: ["press@bae.band"], note: "For interviews, press kits and media requests." },
];

const FAQS = [
  { question: "How do I submit music or a demo?", answer: "Send a link to your music along with a short bio to submissions@bae.band, or use the subject line \"Submission\" on the contact form." },
  { question: "How can I book an artist?", answer: "Reach out via the contact form with the event details, dates and budget, and our booking team will follow up." },
  { question: "How do I become a partner or sponsor?", answer: "We're always open to partnerships that align with the culture. Tell us about your brand using the form below." },
  { question: "Do you offer internships?", answer: "Yes — internship openings are posted periodically across our labels. Send your resume to info@bae.band to be considered." },
  { question: "What are your licensing terms?", answer: "For sync, licensing or usage requests, contact press@bae.band with details on the intended use." },
  { question: "How long does it take to get a response?", answer: "We reply fast — expect to hear back within 24 hours on business days." },
];

export default function ContactPage() {
  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-8 lg:px-10 lg:pt-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
            <div>
              <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tightest text-ink sm:text-5xl">
                Contact Us
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-onlight">
                We&apos;d love to hear from you. Whether it&apos;s a question, collaboration, partnership or just a hello
                — we&apos;re here for you.
              </p>
              <div className="mt-7 flex flex-wrap gap-8">
                <div className="flex items-center gap-2.5">
                  <Headphones className="size-5" />
                  <p className="text-xs font-semibold leading-tight">
                    24/7 Support
                    <br />
                    <span className="font-normal text-muted-onlight">We&apos;re here to help anytime.</span>
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Send className="size-5" />
                  <p className="text-xs font-semibold leading-tight">
                    We Reply Fast
                    <br />
                    <span className="font-normal text-muted-onlight">Expect a response within 24 hours.</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-[4/3]">
              <Placeholder tone="ag20" aspect="aspect-auto h-full" pattern="grid" />
            </div>
          </div>
        </div>
      </section>

      <section id="submissions" className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm />

          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">Other Ways to Reach Us</h2>
            <div className="mt-5 space-y-3">
              {REACH.map((r) => (
                <div key={r.title} className="flex gap-4 border border-black/10 bg-white p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-black/10 bg-paper-soft">
                    <r.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{r.title}</p>
                    {r.lines.map((l) => (
                      <p key={l} className="text-sm text-muted-onlight">{l}</p>
                    ))}
                    <p className="mt-1 text-xs text-muted-onlight">{r.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-14 lg:px-10">
        <div className="grid grid-cols-1 gap-6 border border-black/10 bg-white p-6 sm:grid-cols-[260px_1fr] sm:p-8">
          <div>
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-ink">Where to Find Us</h3>
            <p className="mt-3 text-sm text-muted-onlight">
              BAE HQ
              <br />
              Los Angeles, CA
              <br />
              United States
            </p>
            <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink hover:text-gold">
              Get Directions <ArrowRight className="size-3" />
            </a>
          </div>
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-soft">
            <Placeholder tone="ink" aspect="aspect-auto h-full" pattern="grid" icon={MapPin} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">Frequently Asked Questions</h2>
        <Accordion items={FAQS} className="mt-6" />
      </section>
    </div>
  );
}
