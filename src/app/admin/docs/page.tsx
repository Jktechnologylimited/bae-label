import type { Metadata } from "next";
import {
  LogIn,
  LayoutDashboard,
  CalendarDays,
  Mic2,
  Disc3,
  Newspaper,
  ImageIcon,
  Receipt,
  Ticket as TicketIcon,
  ScanLine,
  Users,
  MessageCircle,
  UserCircle,
  CreditCard,
  LifeBuoy,
} from "lucide-react";
import { DocSection, DocSteps, DocTip, DocLink } from "./components";

export const metadata: Metadata = { title: "Admin — Documentation" };

const TOC = [
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard", label: "Dashboard Overview" },
  { id: "events", label: "Events & Ticket Pricing" },
  { id: "artists", label: "Artists" },
  { id: "releases", label: "Releases & Streaming Links" },
  { id: "news", label: "News" },
  { id: "images", label: "Uploading Images" },
  { id: "orders", label: "Orders" },
  { id: "tickets", label: "Tickets" },
  { id: "verify", label: "Door Check-In Scanner" },
  { id: "users", label: "Users & Roles" },
  { id: "whatsapp", label: "WhatsApp Widget" },
  { id: "customers", label: "What Customers See" },
  { id: "connections", label: "Payments, Email & Google Login" },
  { id: "help", label: "Getting Help" },
];

export default function AdminDocsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Documentation</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        A plain-English guide to running the site day to day — adding shows, pricing tickets, managing content, and
        everything else in this dashboard. For developer/technical setup (environment variables, deployment), see
        the <code className="border border-line bg-ink-elevated px-1.5 py-0.5 text-xs">README.md</code> in the
        project files instead — this page is about how to <em>use</em> what&apos;s already built, not how to set it
        up from scratch.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">On This Page</p>
          <nav className="mt-3 space-y-2">
            {TOC.map((item, i) => (
              <a key={item.id} href={`#${item.id}`} className="block text-sm text-muted transition-colors hover:text-paper">
                {i + 1}. {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <DocSection id="getting-started" title="Getting Started" icon={LogIn}>
            <p>
              Log in at <code className="border border-line bg-ink-elevated px-1.5 py-0.5 text-xs">/login</code>{" "}
              with your admin email and password. Admin accounts land on this dashboard automatically; customer
              accounts land on their own order/ticket page instead.
            </p>
            <DocTip variant="warning">
              If this is a fresh install, a default admin account was created automatically the first time the app
              ran — check the server&apos;s terminal output for the email and password it generated, log in, and{" "}
              <DocLink href="/account">change that password immediately</DocLink> before anyone else touches the
              site.
            </DocTip>
            <p>
              Forgot your password? Use the <strong className="text-paper">Forgot password?</strong> link on the
              login page — it emails you a reset link that&apos;s valid for one hour.
            </p>
          </DocSection>

          <DocSection id="dashboard" title="Dashboard Overview" icon={LayoutDashboard}>
            <p>
              The <DocLink href="/admin">Overview</DocLink> page is your at-a-glance summary: total revenue, order
              count, tickets sold vs. scanned, and how many upcoming shows you have. Below that, a quick look at your
              five most recent orders and events, each linking through to the full list.
            </p>
            <p>Everything else in this dashboard lives behind the sidebar links on the left (or the menu on mobile).</p>
          </DocSection>

          <DocSection id="events" title="Events & Ticket Pricing" icon={CalendarDays}>
            <p>
              This is where shows — and their prices — live. Go to <DocLink href="/admin/events">Events</DocLink>{" "}
              to see everything you&apos;ve got, or start a new one.
            </p>
            <DocSteps
              items={[
                {
                  title: "Click \u201cNew Event\u201d",
                  body: "Fill in the name, date, time, city and venue, a short description, and which label(s) it's under (BigDripUniverse / AG20 / ElmayanaConcept — pick as many as apply).",
                },
                {
                  title: "Set ticket tiers — this is where pricing lives",
                  body: (
                    <>
                      Scroll to <strong className="text-paper">Ticket Tiers</strong>. Each tier is a name (e.g. &ldquo;Early
                      Bird&rdquo;, &ldquo;VIP&rdquo;), a price, a fee, and an optional note. Click{" "}
                      <strong className="text-paper">Add Tier</strong> for as many price levels as you want, or the trash
                      icon to remove one. There&apos;s no separate &ldquo;pricing&rdquo; page — this is it.
                    </>
                  ),
                },
                {
                  title: "Add a poster image (optional)",
                  body: "Upload a photo under the image field — see \u201cUploading Images\u201d below for format/size limits.",
                },
                {
                  title: "Save",
                  body: "The event appears on the public /events and /tickets pages immediately — no publish step, no waiting.",
                },
              ]}
            />
            <p>
              To change a price later, open the event from the Events list and edit the tier&apos;s price/fee field —
              this only affects <em>new</em> ticket purchases; tickets already sold keep the price the buyer paid.
            </p>
            <DocTip>
              Set an event&apos;s <strong className="text-paper">Status</strong> to &ldquo;Past&rdquo; once it&apos;s
              happened — it moves from the upcoming list to the past-events list on the public site instead of
              disappearing.
            </DocTip>
          </DocSection>

          <DocSection id="artists" title="Artists" icon={Mic2}>
            <p>
              <DocLink href="/admin/artists">Artists</DocLink> works the same way as Events: a list, a{" "}
              <strong className="text-paper">New Artist</strong> button, and Edit/Delete on each row. Fill in name,
              genre, which label they&apos;re signed to, a short bio, and mark them &ldquo;New&rdquo; or
              &ldquo;Active&rdquo; (new artists get a small &ldquo;New&rdquo; badge on the public site). Add a photo
              the same way as everywhere else — see &ldquo;Uploading Images&rdquo; below.
            </p>
          </DocSection>

          <DocSection id="releases" title="Releases & Streaming Links" icon={Disc3}>
            <p>
              <DocLink href="/admin/releases">Releases</DocLink> covers albums, EPs and singles. Along with the
              basics (title, artist, label, year, a one-line blurb), each release has two dynamic lists:
            </p>
            <DocSteps
              items={[
                {
                  title: "Tracklist",
                  body: "Add each track's title and duration. Click Add Track for more, the trash icon to remove one.",
                },
                {
                  title: "Streaming Links — this is how songs show up on Spotify, Apple Music, etc.",
                  body: (
                    <>
                      Pick a platform from the dropdown (Spotify, Apple Music, YouTube Music, Audiomack, Boomplay,
                      SoundCloud) and paste that song&apos;s URL from the platform itself. Add one row per platform.
                      These turn into clickable branded icons on the release everywhere it&apos;s shown, and full
                      labeled buttons on the &ldquo;Featured Release&rdquo; spotlight on the public Releases page.
                    </>
                  ),
                },
              ]}
            />
            <DocTip>
              No streaming links added yet? The release still shows fine — it just falls back to a plain
              &ldquo;Listen Now&rdquo; button instead of platform-specific ones.
            </DocTip>
          </DocSection>

          <DocSection id="news" title="News" icon={Newspaper}>
            <p>
              <DocLink href="/admin/news">News</DocLink> posts need a title, a category (Announcement, Music,
              Events, Culture, Industry or Press), a short excerpt, a date, and a read-time estimate (just a label
              like &ldquo;3 min read&rdquo; — it&apos;s not calculated automatically). The newest post by date
              becomes the large &ldquo;Featured&rdquo; story at the top of the public News page automatically.
            </p>
          </DocSection>

          <DocSection id="images" title="Uploading Images" icon={ImageIcon}>
            <p>
              Every content form — Events, Artists, Releases, News — has the same image field: click to upload a
              JPG, PNG, WebP or GIF up to 5MB. The photo replaces the placeholder artwork everywhere that item
              appears on the public site, immediately. Click <strong className="text-paper">Replace Image</strong>{" "}
              to swap it, or the small × in the corner of the preview to remove it.
            </p>
            <DocTip variant="warning">
              Uploaded images are stored on the server this app runs on. If you move the site to a different host or
              a serverless platform later, ask whoever manages the deployment whether uploads need to move to
              proper file storage first — see the README&apos;s &ldquo;Image uploads&rdquo; section for the
              technical detail.
            </DocTip>
          </DocSection>

          <DocSection id="orders" title="Orders" icon={Receipt}>
            <p>
              <DocLink href="/admin/orders">Orders</DocLink> is a read-only list of every ticket purchase — who
              bought, which event, how many tickets, total paid, and status (pending, paid, failed or cancelled).
              Use it to look someone up if they email or WhatsApp you about a purchase.
            </p>
          </DocSection>

          <DocSection id="tickets" title="Tickets" icon={TicketIcon}>
            <p>
              <DocLink href="/admin/tickets">Tickets</DocLink> lists every individual ticket that&apos;s been issued
              — one row per ticket, not per order. From here you can:
            </p>
            <DocSteps
              items={[
                {
                  title: "Issue a ticket manually",
                  body: "Click \u201cIssue Ticket\u201d for comps, giveaways, or anyone who paid you outside the website (bank transfer, cash, etc.). Pick the event and tier, enter the holder's name and email, and it creates a \u20a60 ticket with a working QR code — no payment step.",
                },
                {
                  title: "Edit a ticket",
                  body: "Fix a misspelled name, change its tier, or manually flip its status between Valid / Used / Void.",
                },
                {
                  title: "Void a ticket",
                  body: "Blocks it from being scanned at the door without deleting the record — use this for refunds or cancellations you still want a paper trail for.",
                },
                {
                  title: "Delete a ticket",
                  body: "Permanently removes it. Use this only when you actually want the record gone, not just invalid.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="verify" title="Door Check-In Scanner" icon={ScanLine}>
            <p>
              <DocLink href="/verify">/verify</DocLink> is the check-in screen for event staff — it requires an
              admin login, so whoever&apos;s working the door needs an admin account (see &ldquo;Users &amp;
              Roles&rdquo; below).
            </p>
            <p>
              Every digital ticket&apos;s QR code encodes a link to this page with the ticket&apos;s code already
              filled in — so scanning it with <em>any</em> phone&apos;s regular camera app opens the check-in screen
              pre-filled and ready to confirm, no special scanner app needed. There&apos;s also a manual entry field
              for typing a code in by hand if a phone won&apos;t scan.
            </p>
            <p>
              A green screen means entry approved and the ticket is now marked used. A second scan of the same
              ticket is automatically rejected and shows when it was already used. Tap{" "}
              <strong className="text-paper">Scan Next Ticket</strong> to reset for the next guest.
            </p>
            <DocTip variant="warning">
              Right now, checking guests in requires the same admin login that can also edit prices and content —
              there&apos;s no lighter &ldquo;door staff only&rdquo; account type yet. Only hand out admin logins to
              people you trust with the whole dashboard, or have a technical person add a restricted role first.
            </DocTip>
          </DocSection>

          <DocSection id="users" title="Users & Roles" icon={Users}>
            <p>
              <DocLink href="/admin/users">Users</DocLink> lists everyone with an account — customers get one
              automatically the first time they buy a ticket or sign up; admins are added manually. Click the role
              badge next to someone&apos;s name to toggle them between Customer and Admin.
            </p>
            <DocTip variant="warning">You can&apos;t remove your own admin access from this screen — that&apos;s intentional, so you can&apos;t accidentally lock yourself out.</DocTip>
          </DocSection>

          <DocSection id="whatsapp" title="WhatsApp Widget" icon={MessageCircle}>
            <p>
              The floating WhatsApp button on every public page is configured at{" "}
              <DocLink href="/admin/settings">Settings</DocLink>:
            </p>
            <DocSteps
              items={[
                { title: "Toggle it on or off", body: "Turn the whole widget off site-wide if you don't want it showing for a while." },
                {
                  title: "Set your WhatsApp number",
                  body: "Country code first, digits only — no spaces, dashes, or a leading +. For example 2348012345678, not +234 801 234 5678.",
                },
                { title: "Write a greeting message", body: "This is the first message visitors see when they open the chat panel." },
                { title: "Add quick-reply prompts", body: "Short pre-written questions people can tap instead of typing — they fill the message box, which the visitor can still edit before sending." },
              ]}
            />
            <p>
              When someone taps Send, it opens WhatsApp (app or web) with their message pre-filled, addressed to the
              number you set — the same way most business WhatsApp widgets work. There&apos;s also an FAQ tab in the
              widget that answers common questions inline before someone needs to message you at all; it shares
              content with the <DocLink href="/faqs">public FAQ page</DocLink>.
            </p>
          </DocSection>

          <DocSection id="customers" title="What Customers See" icon={UserCircle}>
            <p>Useful to know so you can explain it or troubleshoot for someone:</p>
            <DocSteps
              items={[
                {
                  title: "Buying a ticket doesn't require an account first",
                  body: "A customer picks tickets on /tickets, enters their name and email, and checks out. If that email doesn't already have an account, one is created for them automatically and they're signed in — no separate signup step required.",
                },
                {
                  title: "Their account shows every ticket they own",
                  body: "At /account, each order lists its tickets with a live status (valid / used / void) and a QR code. Tapping a ticket opens its full-page version, which is what they show at the door.",
                },
                {
                  title: "They can also sign in with Google",
                  body: "If Google sign-in is configured (see \u201cPayments, Email & Google Login\u201d below), \u201cContinue with Google\u201d appears on the login and signup pages as an alternative to a password.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="connections" title="Payments, Email & Google Login" icon={CreditCard}>
            <p>
              Three outside services plug into this site — Paystack (payments), Resend (email), and Google (sign-in).
              Setting them up involves creating accounts on those services and pasting some keys into an environment
              file, which is developer/technical work — full step-by-step instructions are in the project&apos;s{" "}
              <code className="border border-line bg-ink-elevated px-1.5 py-0.5 text-xs">README.md</code>, under
              &ldquo;Connecting Paystack&rdquo;, &ldquo;Connecting Resend&rdquo;, and &ldquo;Connecting Google
              Sign-In&rdquo;.
            </p>
            <DocTip>
              Until those are connected, the site runs in a safe &ldquo;test mode&rdquo; automatically: checkout
              skips straight to a confirmed ticket instead of a real payment page, emails get logged on the server
              instead of sent, and the Google button explains it isn&apos;t set up yet instead of erroring. Nothing
              breaks — you just won&apos;t take real payments or send real email until those are connected.
            </DocTip>
          </DocSection>

          <DocSection id="help" title="Getting Help" icon={LifeBuoy}>
            <p>
              For anything about how the site is built, deployed, or configured — not covered by this page — see the{" "}
              <code className="border border-line bg-ink-elevated px-1.5 py-0.5 text-xs">README.md</code> included
              with the project files. It covers the technical side: environment variables, the data storage model,
              and exactly what&apos;s left to do before a real launch.
            </p>
            <p>
              Something on this page out of date, or a feature you&apos;d expect isn&apos;t covered? That usually
              means the site has grown since this page was last updated — worth a quick check against the actual
              dashboard.
            </p>
          </DocSection>
        </div>
      </div>
    </div>
  );
}
