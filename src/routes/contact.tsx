import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { useLang } from "@/hooks/use-lang";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title:
          "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064a\u0642 Bouiba Academy \u2014 \u0646\u062d\u0646 \u0647\u0646\u0627",
      },
      {
        name: "description",
        content:
          "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064a\u0642 Bouiba Academy \u2014 \u0644\u0623\u0633\u0626\u0644\u062a\u0643\u060c \u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a\u0643\u060c \u0623\u0648 \u0641\u0631\u0635 \u0627\u0644\u062a\u0639\u0627\u0648\u0646 \u0641\u064a \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0627\u0644\u0639\u0631\u0628\u064a.",
        key: "description",
      },
      {
        property: "og:title",
        content:
          "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064a\u0642 Bouiba Academy \u2014 \u0646\u062d\u0646 \u0647\u0646\u0627",
        key: "og:title",
      },
      {
        property: "og:description",
        content:
          "\u0631\u0627\u0633\u0644 \u0641\u0631\u064a\u0642 Bouiba Academy \u0644\u0623\u064a \u0633\u0624\u0627\u0644\u060c \u0627\u0642\u062a\u0631\u0627\u062d\u060c \u0623\u0648 \u062a\u0639\u0627\u0648\u0646 \u0641\u064a \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a.",
        key: "og:description",
      },
      {
        property: "og:image",
        content: "https://www.bouibacademy.me/og-banner.png",
        key: "og:image",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/contact", key: "og:url" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useLang();

  const heroBadge = lang === "fr" ? "Contact" : lang === "en" ? "Contact" : "تواصل";
  const heroTitle =
    lang === "fr" ? "Restons en contact" : lang === "en" ? "Let’s Stay in Touch" : "لنبقَ على تواصل";
  const heroSub =
    lang === "fr"
      ? "Question, suggestion ou idée de collaboration ? Nous sommes ravis de recevoir vos messages."
      : lang === "en"
      ? "A question, suggestion, or collaboration idea? We’d love to hear from you."
      : "سؤال، اقتراح، أو فكرة للتعاون؟ يسعدنا استقبال رسائلك.";

  const CONTACT_ITEMS = [
    {
      icon: Mail,
      title: lang === "fr" ? "E-mail" : lang === "en" ? "Email" : "البريد الإلكتروني",
      value: "contact@bouibacademy.me",
      href: "mailto:contact@bouibacademy.me",
    },
    {
      icon: MessageCircle,
      title: lang === "fr" ? "Messages" : lang === "en" ? "Messages" : "الرسائل",
      value: lang === "fr" ? "Via les réseaux sociaux" : lang === "en" ? "Via social media" : "عبر صفحات التواصل",
      href: "#",
    },
    {
      icon: Globe,
      title: lang === "fr" ? "Site web" : lang === "en" ? "Website" : "المدونة",
      value: "bouibacademy.me",
      href: "https://www.bouibacademy.me",
    },
  ];

  const namePlaceholder = lang === "fr" ? "Votre nom" : lang === "en" ? "Your name" : "الاسم";
  const emailPlaceholder = lang === "fr" ? "Votre e-mail" : lang === "en" ? "Your email" : "البريد الإلكتروني";
  const subjectPlaceholder = lang === "fr" ? "Sujet" : lang === "en" ? "Subject" : "الموضوع";
  const messagePlaceholder = lang === "fr" ? "Votre message..." : lang === "en" ? "Your message..." : "رسالتك...";
  const sendLabel = lang === "fr" ? "Envoyer le message" : lang === "en" ? "Send Message" : "إرسال الرسالة";
  const formTitle = lang === "fr" ? "Envoyer un message" : lang === "en" ? "Send a Message" : "أرسل رسالة";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="hero-bg border-b border-border">
          <div className="container-page py-16 md:py-24 text-center max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-3">{heroBadge}</p>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold">{heroTitle}</h1>
            <p className="mt-4 text-lg text-foreground/80">{heroSub}</p>
          </div>
        </section>

        <section className="container-page py-16">
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {CONTACT_ITEMS.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elegant hover:-translate-y-0.5"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground break-all">{c.value}</p>
              </a>
            ))}
          </div>

          <form className="mt-14 max-w-2xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-card">
            <h2 className="font-display text-2xl font-bold mb-6">{formTitle}</h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="sr-only">{namePlaceholder}</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder={namePlaceholder}
                    aria-label={namePlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">{emailPlaceholder}</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder={emailPlaceholder}
                    aria-label={emailPlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <label htmlFor="contact-subject" className="sr-only">{subjectPlaceholder}</label>
              <input
                id="contact-subject"
                type="text"
                placeholder={subjectPlaceholder}
                aria-label={subjectPlaceholder}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <label htmlFor="contact-message" className="sr-only">{messagePlaceholder}</label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder={messagePlaceholder}
                aria-label={messagePlaceholder}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition-all"
              >
                {sendLabel}
              </button>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
