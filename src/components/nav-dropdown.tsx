import { Link } from "@tanstack/react-router";
import { ChevronDown, FileText, Image, Languages, Lightbulb, Search, Sparkles, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  "file-text": FileText,
  languages: Languages,
  lightbulb: Lightbulb,
  search: Search,
  sparkles: Sparkles,
  tag: Tag,
};

export type NavDropdownItem = {
  label: string;
  to: string;
  search?: Record<string, string>;
  description?: string;
  icon?: string;
  badge?: number | string;
};

type Props = {
  label: string;
  to?: string;
  items: NavDropdownItem[];
  footer?: { label: string; to: string; search?: Record<string, string> };
  onLoad?: () => void;
};

export function NavDropdown({ label, to, items, footer, onLoad }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) onLoad?.();
  }, [open, onLoad]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="nav-link"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 min-w-[220px] max-w-[280px] rounded-2xl glass-panel shadow-elegant p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200 origin-top-end"
        >
          {to && (
            <Link
              to={to}
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/70 transition-colors"
            >
              <span>{label} — نظرة عامة</span>
              <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            </Link>
          )}
          {to && items.length > 0 && <div className="my-1.5 h-px bg-gradient-to-l from-transparent via-border to-transparent" />}
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-muted-foreground">لا توجد عناصر بعد</li>
            ) : (
              items.map((it, i) => {
                const Icon = it.icon ? ICON_MAP[it.icon] : undefined;
                return (
                  <li key={i}>
                    <Link
                      to={it.to}
                      search={it.search as never}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/70 hover:text-foreground transition-colors"
                    >
                      {Icon && (
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{it.label}</span>
                          {it.badge !== undefined && (
                            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-foreground tabular-nums">
                              {it.badge}
                            </span>
                          )}
                        </div>
                        {it.description && (
                          <span className="block text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">{it.description}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
          {footer && (
            <>
              <div className="my-1.5 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
              <Link
                to={footer.to}
                search={footer.search as never}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <span>{footer.label}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-primary/70 group-hover:text-primary transition-colors" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
