import { useEffect } from "react";
import { X, Radio, ExternalLink, Maximize2 } from "lucide-react";

/**
 * Single-source stream modal.
 *
 * Per user's decision, all match streams are now served exclusively from
 * https://tv.bouibacademy.me/#sports — every other provider (yalladown,
 * yallasellit, streamed.pk, SportSRC …) was returning broken or ad-heavy
 * embeds. This component ignores any `directUrl` / `matchId` passed in and
 * always embeds StreamHub.
 */
const STREAM_URL = "https://tv.bouibacademy.me/#sports";

export function StreamModal({
  title,
  onClose,
}: {
  matchId?: string;
  title: string;
  fallbackSearch?: string;
  directUrl?: string;
  directUrls?: string[];
  directLabel?: string;
  home?: string;
  away?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-card rounded-2xl border border-border shadow-elegant overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold truncate">{title}</div>
              <div className="text-[11px] text-muted-foreground">
                البث المباشر عبر StreamHub — tv.bouibacademy.me
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="h-9 w-9 rounded-lg border border-border hover:bg-accent transition inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Player */}
        <div className="relative bg-black aspect-video">
          <iframe
            src={STREAM_URL}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full border-0"
          />
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <a
              href={STREAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-950 px-3 py-1.5 text-xs font-bold shadow-soft transition"
            >
              <Maximize2 className="h-3.5 w-3.5" /> فتح بملء الشاشة
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            جميع مباريات كأس العالم 2026 والدوريات الكبرى تُبث حصريًا الآن عبر منصّتنا StreamHub. اختر المباراة من قسم Sports داخل المشغّل.
          </p>
          <a
            href={STREAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:opacity-90 text-primary-foreground px-3 py-1.5 text-xs font-semibold transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> فتح StreamHub في نافذة جديدة
          </a>
        </div>
      </div>
    </div>
  );
}
