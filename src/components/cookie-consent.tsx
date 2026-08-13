import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useLang } from "@/hooks/use-lang";

const COOKIE_CONSENT_KEY = "bouiba_cookie_consent_v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Delay 1.5s for a smooth entrance
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore localstorage errors
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // ignore
    }
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  const isFr = lang === "fr";
  const isEn = lang === "en";

  const title = isFr
    ? "Protection de vos données 🍪"
    : isEn
    ? "We Value Your Privacy 🍪"
    : "نحترم خصوصيتك 🍪";

  const message = isFr
    ? "Nous utilisons des cookies et des technologies similaires pour analyser le trafic, personnaliser le contenu et afficher des publicités Google AdSense pertinentes."
    : isEn
    ? "We use cookies and similar technologies to analyze traffic, personalize content, and serve relevant Google AdSense ads."
    : "نستخدم ملفات تعريف الارتباط (الكوكيز) وتقنيات التحليل لتحسين تجربة تصفحك، وعرض إعلانات Google AdSense ذات الصلة وتخصيص المحتوى.";

  const acceptText = isFr ? "Accepter tout" : isEn ? "Accept All" : "موافقة وقبول";
  const declineText = isFr ? "Refuser" : isEn ? "Decline" : "رفض الكوكيز غير الضرورية";
  const privacyText = isFr ? "Politique de confidentialité" : isEn ? "Privacy Policy" : "سياسة الخصوصية";

  return (
    <div
      dir={isFr || isEn ? "ltr" : "rtl"}
      className="fixed bottom-4 inset-x-4 md:start-6 md:inset-x-auto z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-5 shadow-2xl space-y-3 text-card-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Cookie className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm font-display">{title}</h3>
          </div>
          <button
            onClick={handleDecline}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>

        <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
          <Link
            to="/privacy"
            className="text-[11px] font-semibold text-primary underline hover:opacity-80 transition-opacity"
          >
            {privacyText}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-semibold text-muted-foreground transition-colors"
            >
              {declineText}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-lg bg-primary hover:opacity-90 text-xs font-bold text-primary-foreground shadow-soft transition-all"
            >
              {acceptText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
