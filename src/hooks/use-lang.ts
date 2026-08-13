/**
 * Bouiba Academy — useLang Hook
 * Central language management: reads from localStorage + document attributes.
 *
 * Supports: "ar" (Arabic, RTL) | "fr" (French, LTR) | "en" (English, LTR)
 *
 * Usage:
 *   const { lang, t, isRTL, isAR, isEN, isFR } = useLang();
 */

import { useState, useEffect, useCallback } from "react";
import { type Lang, type I18nKey, translate } from "@/lib/i18n";

export type { Lang };

function readLangFromDOM(): Lang {
  if (typeof window === "undefined") return "ar";
  const saved = window.localStorage.getItem("bouiba_lang") as Lang | null;
  if (saved === "ar" || saved === "en" || saved === "fr") return saved;
  const attr = document.documentElement.dataset.uiLang as Lang | undefined;
  if (attr === "ar" || attr === "en" || attr === "fr") return attr;
  return "ar";
}

function applyLangToDOM(lang: Lang) {
  if (typeof window === "undefined") return;
  const isRTL = lang === "ar";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.dataset.uiLang = lang;
  window.localStorage.setItem("bouiba_lang", lang);
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>("ar");

  // Hydrate from DOM/localStorage on mount
  useEffect(() => {
    setLangState(readLangFromDOM());

    // Listen for changes triggered by other tabs or components
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bouiba_lang" && e.newValue) {
        const newLang = e.newValue as Lang;
        if (newLang === "ar" || newLang === "en" || newLang === "fr") {
          setLangState(newLang);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    // Also observe data-ui-lang attribute changes (e.g., from SiteHeader)
    const observer = new MutationObserver(() => {
      setLangState(readLangFromDOM());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ui-lang"],
    });

    return () => {
      window.removeEventListener("storage", onStorage);
      observer.disconnect();
    };
  }, []);

  /** Switch language, apply to DOM, and reload the page */
  const switchLanguage = useCallback((newLang: Lang) => {
    applyLangToDOM(newLang);

    // Handle Google Translate cookie for EN
    if (newLang === "en") {
      document.cookie = "googtrans=/ar/en; path=/";
      document.cookie = `googtrans=/ar/en; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    window.location.reload();
  }, []);

  /** Translate a key for the current language */
  const t = useCallback(
    (key: I18nKey) => translate(lang, key),
    [lang],
  );

  return {
    lang,
    t,
    switchLanguage,
    isRTL: lang === "ar",
    isAR: lang === "ar",
    isEN: lang === "en",
    isFR: lang === "fr",
    /** Flag emoji for the current language */
    langFlag: lang === "ar" ? "🇩🇿" : lang === "fr" ? "🇫🇷" : "🇬🇧",
    /** Full language name in current language */
    langName: lang === "ar" ? "العربية" : lang === "fr" ? "Français" : "English",
  };
}
