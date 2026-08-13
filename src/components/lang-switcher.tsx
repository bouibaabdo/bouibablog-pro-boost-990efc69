/**
 * LangSwitcher — Bouiba Academy
 * Dropdown language switcher supporting AR / FR / EN.
 * Displays flag, code, and full name for each language.
 */

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLang, type Lang } from "@/hooks/use-lang";

const LANGUAGES: Array<{
  code: Lang;
  name: string;
  nativeName: string;
  flag: string;
  dir: "rtl" | "ltr";
  colorClass: string;
  bgClass: string;
}> = [
  {
    code: "ar",
    name: "العربية",
    nativeName: "عربي",
    flag: "🇩🇿",
    dir: "rtl",
    colorClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    code: "fr",
    name: "Français",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    colorClass: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

interface LangSwitcherProps {
  /** Display variant */
  variant?: "compact" | "full";
  className?: string;
}

export function LangSwitcher({ variant = "compact", className = "" }: LangSwitcherProps) {
  const { lang, switchLanguage } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        id="lang-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="تغيير اللغة / Change language / Changer de langue"
        className={`
          inline-flex items-center gap-1.5 rounded-lg border border-border
          px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer
          hover:shadow-sm active:scale-95
          ${open
            ? "bg-accent/70 border-primary/40 text-foreground"
            : "bg-accent/30 text-foreground hover:bg-accent"
          }
        `}
      >
        <Globe className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{current.flag}</span>
        {variant === "compact" ? (
          <span>{current.code.toUpperCase()}</span>
        ) : (
          <span>{current.nativeName}</span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className={`
            absolute top-full mt-2 z-50 min-w-[170px]
            rounded-xl border border-border bg-popover shadow-lg
            overflow-hidden
            animate-scale-in origin-top
            ${lang === "ar" ? "end-0" : "start-0"}
          `}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Language / اللغة / Langue
            </p>
          </div>

          {/* Options */}
          <div className="p-1.5 space-y-0.5">
            {LANGUAGES.map((l) => {
              const isActive = l.code === lang;
              return (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (!isActive) switchLanguage(l.code);
                  }}
                  className={`
                    w-full flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm font-medium transition-all text-start cursor-pointer
                    ${isActive
                      ? `${l.bgClass} ${l.colorClass} font-semibold`
                      : "text-foreground hover:bg-accent/50"
                    }
                  `}
                >
                  {/* Flag */}
                  <span className="text-lg leading-none" aria-hidden="true">
                    {l.flag}
                  </span>

                  {/* Name */}
                  <div className="flex-1 min-w-0" dir={l.dir}>
                    <div className="font-semibold text-sm leading-none">{l.name}</div>
                    {l.nativeName !== l.name && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">{l.nativeName}</div>
                    )}
                  </div>

                  {/* Active check */}
                  {isActive && (
                    <Check className={`h-3.5 w-3.5 shrink-0 ${l.colorClass}`} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-border/60 bg-muted/30">
            <p className="text-[9px] text-muted-foreground text-center">
              الصفحة ستُعاد تحميلها • Page will reload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * LangBadge — Small inline badge showing the language of a post/card.
 */
export function LangBadge({
  lang,
  className = "",
}: {
  lang: "ar" | "fr" | "en";
  className?: string;
}) {
  const configs = {
    ar: { flag: "🇩🇿", label: "AR", className: "lang-ar border" },
    fr: { flag: "🇫🇷", label: "FR", className: "lang-fr border" },
    en: { flag: "🇬🇧", label: "EN", className: "lang-en border" },
  };

  const cfg = configs[lang];
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5
        text-[10px] font-bold tracking-wide
        ${cfg.className} ${className}
      `}
    >
      <span aria-hidden="true">{cfg.flag}</span>
      {cfg.label}
    </span>
  );
}
