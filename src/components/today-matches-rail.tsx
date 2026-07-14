import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PlayCircle, Tv, ArrowLeft, Radio, Clock } from "lucide-react";
import { getYalladownMatches, type YDMatch } from "@/lib/yalladown.functions";
import { getYallasellitMatches } from "@/lib/yallasellit.functions";
import { buildStreamLookup, normalizeArName } from "@/lib/match-streams";
import { StreamModal } from "@/components/stream-modal";

/**
 * Horizontal, snap-scrolling rail of today's live/upcoming matches for the
 * home page and article footers. Yalladown is the primary stream source;
 * Yallasellit acts as a fallback so the "watch" button appears whenever any
 * provider has an embed.
 */
export function TodayMatchesRail({
  variant = "home",
  max = 10,
}: {
  variant?: "home" | "article";
  max?: number;
}) {
  const yd = useQuery({
    queryKey: ["yalladown", "matches"],
    queryFn: () => getYalladownMatches(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const ys = useQuery({
    queryKey: ["yallasellit", "matches"],
    queryFn: () => getYallasellitMatches(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const lookup = useMemo(() => buildStreamLookup(yd.data, ys.data), [yd.data, ys.data]);

  const matches: YDMatch[] = useMemo(() => {
    const src: YDMatch[] = [
      ...(yd.data?.today ?? []),
      ...(yd.data?.tomorrow ?? []),
    ];
    // De-dupe by home+away (normalized).
    const seen = new Set<string>();
    const out: YDMatch[] = [];
    for (const m of src) {
      const key = `${normalizeArName(m.home)}|${normalizeArName(m.away)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (m.finished) continue;
      out.push(m);
      if (out.length >= max) break;
    }
    // Live first.
    out.sort((a, b) => Number(b.live) - Number(a.live));
    return out;
  }, [yd.data, max]);

  const [watch, setWatch] = useState<
    { title: string; urls: string[] } | null
  >(null);

  const openWatch = (m: YDMatch) => {
    const fromLookup = lookup.find(m.home, m.away) ?? [];
    const combined = Array.from(new Set([...(m.streamUrls ?? []), ...fromLookup]));
    if (!combined.length) return;
    setWatch({ title: `${m.home} vs ${m.away}`, urls: combined });
  };

  if (yd.isLoading && !matches.length) {
    return (
      <div className="container-page py-8">
        <div className="h-40 rounded-2xl border border-border bg-surface-muted animate-pulse" />
      </div>
    );
  }
  if (!matches.length) return null;

  const heading =
    variant === "home" ? "مباريات اليوم — بث مباشر" : "مباريات اليوم";

  return (
    <section
      className={
        variant === "home"
          ? "container-page py-8 md:py-12"
          : "container-page py-6"
      }
    >
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {heading}
          </h2>
          {variant === "home" && (
            <p className="mt-1 text-sm text-muted-foreground">
              كأس العالم 2026 وأبرز مباريات اليوم — بتوقيت المغرب
            </p>
          )}
        </div>
        <Link
          to="/worldcup"
          className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline shrink-0"
        >
          كل المباريات <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div
        className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {matches.map((m) => {
          const hasStream =
            (m.streamUrls?.length ?? 0) > 0 || !!lookup.find(m.home, m.away);
          return (
            <article
              key={m.id}
              className={`snap-start shrink-0 w-[280px] md:w-[300px] rounded-2xl border bg-card p-4 shadow-card transition ${
                m.live
                  ? "border-red-500/50 ring-1 ring-red-500/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[65%]">
                  <Tv className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{m.channel || m.league || "مباراة"}</span>
                </span>
                {m.live ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 px-2 py-0.5 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> مباشر
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">
                    <Clock className="h-3 w-3" /> {m.time}
                  </span>
                )}
              </div>
              <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex flex-col items-center gap-1 text-center min-w-0">
                  {m.homeBadge ? (
                    <img src={m.homeBadge} alt={m.home} loading="lazy" className="h-10 w-10 object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-surface-muted" />
                  )}
                  <span dir="rtl" className="text-xs font-semibold leading-tight line-clamp-2">{m.home}</span>
                </div>
                <div className="text-center min-w-[52px]">
                  <div className="font-display font-extrabold text-lg gradient-text">VS</div>
                </div>
                <div className="flex flex-col items-center gap-1 text-center min-w-0">
                  {m.awayBadge ? (
                    <img src={m.awayBadge} alt={m.away} loading="lazy" className="h-10 w-10 object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-surface-muted" />
                  )}
                  <span dir="rtl" className="text-xs font-semibold leading-tight line-clamp-2">{m.away}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openWatch(m)}
                disabled={!hasStream}
                className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition ${
                  !hasStream
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : m.live
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-l from-primary to-primary/80 hover:opacity-95"
                }`}
              >
                {hasStream ? (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    {m.live ? "شاهد الآن" : "شاهد البث"}
                  </>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5" /> غير متوفر
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      {watch && (
        <StreamModal
          matchId={`yd-${watch.urls[0]}`}
          title={watch.title}
          fallbackSearch={watch.title}
          directUrl={watch.urls[0]}
          directUrls={watch.urls.slice(1)}
          directLabel="يلا داون"
          onClose={() => setWatch(null)}
        />
      )}
    </section>
  );
}
