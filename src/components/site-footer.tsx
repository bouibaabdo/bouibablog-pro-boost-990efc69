import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import bouibaLogo from "@/assets/bouiba-logo-v3.png.asset.json";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bouibacademy",
    icon: Facebook,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/bouibacademy",
    icon: Twitter,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bouibacademy",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@bouibacademy",
    icon: Youtube,
  },
];

export function SiteFooter() {
  const { t, isRTL, lang } = useLang();

  return (
    <footer className="border-t border-border/60 bg-surface-muted/40 mt-24">
      <div className="container-page py-14">
        {/* Top grid */}
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 mb-4"
              aria-label="Bouiba Academy"
            >
              <picture>
                <source srcSet="/bouiba-logo-96.webp" type="image/webp" />
                <img
                  src="/favicon-64.png"
                  alt="Bouiba Academy"
                  className="h-9 w-9 object-contain drop-shadow-sm"
                  width={36}
                  height={36}
                />
              </picture>
              <span className="font-display text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Bouiba Academy
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {t("footer.tagline")}
            </p>

            {/* Language badges */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold lang-ar cursor-default"
                title="Available in Arabic"
              >
                🇩🇿 عربي
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold lang-fr cursor-default"
                title="Disponible en français"
              >
                🇫🇷 Français
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold lang-en cursor-default"
                title="Available in English"
              >
                🇬🇧 English
              </span>
            </div>
          </div>

          {/* Explore column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{t("footer.explore")}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/posts" className="hover:text-foreground transition-colors">
                  {t("footer.allArticles")}
                </Link>
              </li>
              <li>
                <Link to="/lessons" className="hover:text-foreground transition-colors">
                  {t("footer.courses")}
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-foreground transition-colors">
                  {t("footer.aiTools")}
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  search={{ label: "English" }}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  {t("footer.englishPosts")}
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  search={{ label: "Français" }}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  {t("footer.frenchContent")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{t("footer.academy")}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-foreground transition-colors">
                  {t("footer.disclaimer")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bouiba Academy.{" "}
            {t("footer.copyright")}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4 text-muted-foreground">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
