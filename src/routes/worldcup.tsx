import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Trophy, Radio, ExternalLink, Clock } from "lucide-react";
import { getWorldCupMatches, type WCMatch } from "@/lib/worldcup.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const wcQuery = queryOptions({
  queryKey: ["worldcup", "2026"],
  queryFn: () => getWorldCupMatches(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/worldcup")({
  loader: ({ context }) => context.queryClient.ensureQueryData(wcQuery),
  head: () => ({
    meta: [
      { title: "كأس العالم 2026 — جدول المباريات والنتائج المباشرة | Bouiba Academy" },
      {
        name: "description",
        content:
          "متابعة كأس العالم 2026 مباشرة: جدول المباريات بتوقيتك، النتائج، المجموعات، دور خروج المغلوب، وروابط البث الرسمية.",
      },
      { property: "og:title", content: "كأس العالم 2026 — البث المباشر والنتائج" },
      { property: "og:description", content: "جدول شامل لمباريات مونديال 2026 مع النتائج المباشرة وروابط البث الرسمية." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/worldcup" }],
  }),
  component: WorldCupPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">تعذر التحميل: {error.message}</div>
  ),
});

const TOURNAMENT_START = new Date("2026-06-11T18:00:00Z").getTime();
const OFFICIAL_STREAMS = [
  { name: "FIFA+ (مجاني)", url: "https://www.plus.fifa.com/", note: "بث رسمي مجاني في مناطق مختارة" },
  { name: "beIN Sports", url: "https://www.beinsports.com/", note: "الحقوق الحصرية في الشرق الأوسط وشمال أفريقيا" },
  { name: "SSC السعودية", url: "https://shahid.mbc.net/", note: "بعض المباريات المختارة" },
  { name: "FOX Sports", url: "https://www.foxsports.com/soccer/fifa-world-cup", note: "الولايات المتحدة" },
];

function formatDateAr(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useMemo(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function MatchCard({ m }: { m: WCMatch }) {
  const isFinished = m.status === "FT" || (m.homeScore != null && m.awayScore != null);
  const isLive = m.status === "LIVE" || m.status === "1H" || m.status === "2H" || m.status === "HT";
  const isUpcoming = !isFinished && !isLive;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          {m.round}
        </span>
        {isLive && (
          <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> مباشر
          </span>
        )}
        {isFinished && <span className="font-semibold text-emerald-600">انتهت</span>}
        {isUpcoming && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> قادمة
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center text-center gap-2">
          {m.homeBadge ? (
            <img src={m.homeBadge} alt={m.home} loading="lazy" className="h-14 w-14 object-contain" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-surface-muted" />
          )}
          <span className="font-semibold text-sm">{m.home}</span>
        </div>

        <div className="text-center min-w-[80px]">
          {isFinished || isLive ? (
            <div className="font-display text-3xl font-extrabold tabular-nums">
              {m.homeScore ?? 0} <span className="text-muted-foreground">-</span> {m.awayScore ?? 0}
            </div>
          ) : (
            <div className="font-display text-lg font-bold text-primary">VS</div>
          )}
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          {m.awayBadge ? (
            <img src={m.awayBadge} alt={m.away} loading="lazy" className="h-14 w-14 object-contain" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-surface-muted" />
          )}
          <span className="font-semibold text-sm">{m.away}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateAr(m.timestamp)}
        </div>
        {m.venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {m.venue}
          </div>
        )}
      </div>

      {(isLive || isUpcoming) && (
        <a
          href="https://www.plus.fifa.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Radio className="h-4 w-4" />
          شاهد البث الرسمي
        </a>
      )}
    </div>
  );
}

type Filter = "all" | "live" | "upcoming" | "finished" | "today";

function WorldCupPage() {
  const { data } = useSuspenseQuery(wcQuery);
  const cd = useCountdown(TOURNAMENT_START);
  const [filter, setFilter] = useState<Filter>("all");

  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return data.matches.filter((m) => {
      const t = new Date(m.timestamp).getTime();
      const finished = m.status === "FT" || (m.homeScore != null && m.awayScore != null);
      const live = ["LIVE", "1H", "2H", "HT"].includes(m.status);
      if (filter === "live") return live;
      if (filter === "finished") return finished;
      if (filter === "upcoming") return !finished && !live && t > now;
      if (filter === "today") return m.date === todayStr;
      return true;
    });
  }, [data.matches, filter, now, todayStr]);

  const counts = useMemo(() => {
    let live = 0,
      upcoming = 0,
      finished = 0,
      today = 0;
    data.matches.forEach((m) => {
      const t = new Date(m.timestamp).getTime();
      const f = m.status === "FT" || (m.homeScore != null && m.awayScore != null);
      const l = ["LIVE", "1H", "2H", "HT"].includes(m.status);
      if (l) live++;
      else if (f) finished++;
      else if (t > now) upcoming++;
      if (m.date === todayStr) today++;
    });
    return { live, upcoming, finished, today };
  }, [data.matches, now, todayStr]);

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "الكل", count: data.matches.length },
    { key: "live", label: "مباشر الآن", count: counts.live },
    { key: "today", label: "اليوم", count: counts.today },
    { key: "upcoming", label: "قادمة", count: counts.upcoming },
    { key: "finished", label: "منتهية", count: counts.finished },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative hero-bg overflow-hidden border-b border-border">
        <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
        <div className="container-page relative py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6 shadow-soft">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            المونديال 2026 — أمريكا · كندا · المكسيك
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="gradient-text">كأس العالم 2026</span>
            <br />
            بث مباشر ونتائج فورية
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-muted-foreground">
            تابع جميع مباريات مونديال 2026 لحظة بلحظة — جدول شامل بتوقيتك، نتائج مباشرة، وروابط البث الرسمي المجاني والمدفوع.
          </p>

          {!cd.done && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-card">
              {[
                { v: cd.d, l: "يوم" },
                { v: cd.h, l: "ساعة" },
                { v: cd.m, l: "دقيقة" },
                { v: cd.s, l: "ثانية" },
              ].map((x, i) => (
                <div key={i} className="text-center min-w-[54px]">
                  <div className="font-display text-2xl md:text-3xl font-extrabold gradient-text tabular-nums">
                    {String(x.v).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{x.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FILTERS */}
      <section className="container-page py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface border-border hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
              {f.count != null && (
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    filter === f.key ? "bg-primary-foreground/20" : "bg-accent"
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">لا توجد مباريات في هذا التصنيف حالياً.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MatchCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>

      {/* OFFICIAL STREAMS */}
      <section className="container-page py-16">
        <div className="rounded-3xl bg-gradient-to-br from-accent/60 to-surface-muted border border-border p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">قنوات البث الرسمية</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              اختر المنصة المتاحة في بلدك لمشاهدة المباريات بجودة عالية وبشكل قانوني.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICIAL_STREAMS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Radio className="h-5 w-5" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                </div>
                <div className="font-display font-bold">{s.name}</div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
