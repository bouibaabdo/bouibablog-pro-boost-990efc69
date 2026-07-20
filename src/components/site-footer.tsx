import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import bouibaLogo from "@/assets/bouiba-logo-v3.png.asset.json";

export function SiteFooter() {
  const [lang, setLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = (document.documentElement.lang as "ar" | "en") || "ar";
      setLang(current);
      const observer = new MutationObserver(() => {
        setLang((document.documentElement.lang as "ar" | "en") || "ar");
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      return () => observer.disconnect();
    }
  }, []);

  const isEn = lang === "en";

  return (
    <footer className="border-t border-border/60 bg-surface-muted/40 mt-24">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 mb-3"
              aria-label="Bouiba Academy"
            >
              <div className="logo-mark h-11 w-11 sm:h-12 sm:w-12 shrink-0">
                <img
                  src={bouibaLogo.url}
                  alt="Bouiba Academy"
                  className="h-8 sm:h-9 w-auto object-contain drop-shadow-sm"
                  width={36}
                  height={36}
                />
              </div>
              <span className="gradient-text font-display text-lg sm:text-xl tracking-tight truncate">
                Bouiba Academy
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {isEn
                ? "Your premier AI Academy — practical tutorials, latest news, and free tools to thrive in the artificial intelligence era."
                : "أكاديميتك العربية للذكاء الاصطناعي — دروس عملية، أحدث الأخبار، وأدوات مجانية لمواكبة عصر الذكاء الاصطناعي."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{isEn ? "Explore" : "استكشف"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/posts" className="hover:text-foreground">
                  {isEn ? "All Articles" : "جميع المقالات"}
                </Link>
              </li>
              <li>
                <Link to="/lessons" className="hover:text-foreground">
                  {isEn ? "Courses" : "الدروس"}
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-foreground">
                  {isEn ? "AI Tools" : "أدوات AI"}
                </Link>
              </li>
              <li>
                <Link to="/posts" search={{ label: "English" }} className="hover:text-foreground">
                  {isEn ? "English Posts 🇬🇧" : "المقالات الإنجليزية 🇬🇧"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{isEn ? "Academy" : "الأكاديمية"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground">
                  {isEn ? "About Us" : "من نحن"}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  {isEn ? "Contact Us" : "تواصل معنا"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground">
                  {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  {isEn ? "Terms of Use" : "شروط الاستخدام"}
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-foreground">
                  {isEn ? "Disclaimer" : "إخلاء المسؤولية"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bouiba Academy.{" "}
            {isEn ? "All rights reserved." : "جميع الحقوق محفوظة."}
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Youtube" className="hover:text-primary">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
