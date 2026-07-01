import { useEffect, useState } from "react";
import { X, Radio, Loader2, ExternalLink, Tv, Maximize2 } from "lucide-react";
import {
  embedUrl,
  fetchMatchDetail,
  type SRCDetail,
  type SRCSource,
} from "@/lib/sportsrc";

export function StreamModal({
  matchId,
  title,
  fallbackSearch,
  onClose,
}: {
  matchId: string;
  title: string;
  fallbackSearch: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<SRCDetail | null>(null);
  const [active, setActive] = useState<SRCSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const activeUrl = active ? embedUrl(active) : "";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await fetchMatchDetail(matchId);
        if (!alive) return;
        if (!d || !d.sources?.length) {
          setErr("لم يتم العثور على مصادر بث لهذه المباراة بعد. جرّب قبل انطلاق المباراة بقليل.");
          setLoading(false);
          return;
        }
        setDetail(d);
        setActive(d.sources.find((s) => s.hd) || d.sources[0]);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "تعذر تحميل البث.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchId]);

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
              <div className="text-[11px] text-muted-foreground">البث المباشر — SportSRC</div>
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
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">جارٍ تحميل البث…</span>
            </div>
          )}
          {!loading && err && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6">
              <Tv className="h-10 w-10 text-white/40" />
              <p className="text-white/80 text-sm max-w-md">{err}</p>
              <div className="flex gap-2">
                <a
                  href={`https://www.livesoccertv.com/search/?q=${encodeURIComponent(fallbackSearch)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> القنوات الناقلة
                </a>
                <a
                  href="https://tv.bouibacademy.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 text-sm font-semibold transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> فتح StreamHub
                </a>
              </div>
            </div>
          )}
          {!loading && !err && active && (
            <>
              <iframe
                key={`${active.source}-${active.id}-${active.streamNo}`}
                src={activeUrl}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                /* Sandbox blocks popup ads, forced redirects and new tabs
                   coming from the stream provider. We keep scripts + same-origin
                   + forms so the actual player can still load. */
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full border-0"
              />
              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-950 px-3 py-1.5 text-xs font-bold shadow-soft transition"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> فتح بدون إطار
                </a>
              </div>
            </>
          )}

        </div>

        {/* Sources */}
        {detail && detail.sources.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2.5">
              <Radio className="h-3.5 w-3.5" /> مصادر البث ({detail.sources.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.sources.map((s, i) => {
                const isActive =
                  active &&
                  active.source === s.source &&
                  active.id === s.id &&
                  active.streamNo === s.streamNo;
                return (
                  <div key={`${s.source}-${s.id}-${s.streamNo}-${i}`} className="inline-flex overflow-hidden rounded-lg border border-border bg-surface">
                    <button
                      onClick={() => setActive(s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:text-primary hover:bg-accent"
                      }`}
                    >
                      <span className="uppercase">{s.source}</span>
                      <span className="opacity-70">#{s.streamNo}</span>
                      {s.hd && (
                        <span className="rounded bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 text-[10px] font-bold">
                          HD
                        </span>
                      )}
                      {s.language && (
                        <span className="opacity-70 uppercase text-[10px]">{s.language}</span>
                      )}
                    </button>
                    <a
                      href={embedUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="فتح المصدر مباشرة"
                      title="فتح المصدر مباشرة بدون iframe"
                      className="inline-flex items-center justify-center border-r border-border px-2 text-muted-foreground hover:text-primary hover:bg-accent transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              إذا ظهرت رسالة sandbox داخل المشغّل، اضغط “فتح بدون إطار” أو أيقونة الفتح بجانب المصدر. بعض المزوّدين يمنعون التشغيل داخل iframe.
            </p>
            <a
              href="https://tv.bouibacademy.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border hover:border-primary px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> فتح StreamHub مباشرة
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
