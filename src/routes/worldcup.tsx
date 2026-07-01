import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Trophy, Radio, ExternalLink, Clock, Tv, PlayCircle } from "lucide-react";
import {
  getWorldCupMatches,
  getWorldCupStandings,
  type WCMatch,
  type WCStanding,
} from "@/lib/worldcup.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FavoriteButton } from "@/components/favorite-button";
import { useBrowserReminders } from "@/hooks/use-browser-reminders";
import { supabase } from "@/integrations/supabase/client";
import { StreamModal } from "@/components/stream-modal";
import { fetchFootballMatches, findMatch, type SRCMatch } from "@/lib/sportsrc";
import { getYallakoraMatches, type YKMatch } from "@/lib/yallakora.functions";

const srcQuery = queryOptions({
  queryKey: ["sportsrc", "football"],
  queryFn: () => fetchFootballMatches(),
  staleTime: 60_000,
  refetchInterval: 120_000,
});

const wcQuery = queryOptions({
  queryKey: ["worldcup", "2026"],
  queryFn: () => getWorldCupMatches(),
  staleTime: 5 * 60_000,
});
const standingsQuery = queryOptions({
  queryKey: ["worldcup", "standings", "2026"],
  queryFn: () => getWorldCupStandings(),
  staleTime: 5 * 60_000,
});
const ykQuery = queryOptions({
  queryKey: ["yallakora", "matches"],
  queryFn: () => getYallakoraMatches(),
  staleTime: 60_000,
  refetchInterval: 120_000,
});


export const Route = createFileRoute("/worldcup")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(wcQuery),
      context.queryClient.ensureQueryData(standingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "كأس العالم 2026 — الجدول الكامل، الترتيب، وقنوات البث المباشر" },
      {
        name: "description",
        content:
          "متابعة شاملة لمونديال 2026: جدول كل المباريات، مباريات اليوم مع القنوات الناقلة، ترتيب المجموعات، وروابط البث الرسمي المباشر.",
      },
      { property: "og:title", content: "كأس العالم 2026 — بث مباشر وترتيب المجموعات" },
      {
        property: "og:description",
        content: "جدول شامل، ترتيب المجموعات، ومباريات اليوم مع القنوات الناقلة وروابط المشاهدة المباشرة.",
      },
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

// Per-match aggregator links. These search engines resolve to the exact match page
// with its official broadcasters and legal stream options per country.
function matchLinks(m: WCMatch) {
  const q = encodeURIComponent(`${m.home} vs ${m.away}`);
  const qAr = encodeURIComponent(`${m.home} ${m.away} بث مباشر`);
  return [
    {
      name: "LiveSoccerTV",
      short: "LiveSoccerTV",
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.livesoccertv.com/search/?q=${q}`,
      note: "القنوات الناقلة حسب بلدك",
    },
    {
      name: "Kooora (كورة)",
      short: "Kooora",
      color: "bg-emerald-600 hover:bg-emerald-700",
      url: `https://www.google.com/search?q=${qAr}+site:kooora.com`,
      note: "تغطية عربية وقنوات النقل",
    },
    {
      name: "FIFA+",
      short: "FIFA+",
      color: "bg-indigo-600 hover:bg-indigo-700",
      url: "https://www.plus.fifa.com/en/tournaments/mens/worldcup",
      note: "بث رسمي مجاني — مناطق مختارة",
    },
    {
      name: "Google بحث مباشر",
      short: "Google",
      color: "bg-slate-700 hover:bg-slate-800",
      url: `https://www.google.com/search?q=${qAr}`,
      note: "نتائج بث فورية",
    },
  ];
}

const OFFICIAL_STREAMS = [
  {
    name: "LiveSoccerTV",
    short: "LiveSoccerTV",
    color: "bg-blue-600 hover:bg-blue-700",
    watchUrl: "https://www.livesoccertv.com/competitions/international/world-cup/",
    note: "دليل شامل للقنوات الناقلة لكل مباراة حسب بلدك",
  },
  {
    name: "FIFA+ (مجاني)",
    short: "FIFA+",
    color: "bg-indigo-600 hover:bg-indigo-700",
    watchUrl: "https://www.plus.fifa.com/en/tournaments/mens/worldcup",
    note: "بث رسمي مجاني للمونديال — مناطق مختارة",
  },
  {
    name: "beIN Sports",
    short: "beIN",
    color: "bg-purple-600 hover:bg-purple-700",
    watchUrl: "https://www.beinsports.com/en/schedule",
    note: "الحقوق الحصرية — الشرق الأوسط وشمال أفريقيا",
  },
  {
    name: "Shahid (MBC)",
    short: "Shahid",
    color: "bg-amber-600 hover:bg-amber-700",
    watchUrl: "https://shahid.mbc.net/ar/live",
    note: "بث SSC / MBC — السعودية والخليج",
  },
  {
    name: "SSC السعودية",
    short: "SSC",
    color: "bg-emerald-600 hover:bg-emerald-700",
    watchUrl: "https://ssc.sa/",
    note: "قنوات SSC الرياضية",
  },
  {
    name: "FOX Sports (USA)",
    short: "FOX",
    color: "bg-slate-700 hover:bg-slate-800",
    watchUrl: "https://www.foxsports.com/soccer/fifa-world-cup",
    note: "الولايات المتحدة الأمريكية",
  },
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
function formatDayAr(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr + "T12:00:00"));
  } catch {
    return dateStr;
  }
}
function formatTimeAr(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(iso));
  } catch {
    return "";
  }
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

function statusOf(m: WCMatch) {
  const finished = m.status === "FT" || (m.homeScore != null && m.awayScore != null);
  const live = ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(m.status);
  return { finished, live, upcoming: !finished && !live };
}

function MatchCard({
  m,
  favIds,
  srcMatches,
  onWatch,
}: {
  m: WCMatch;
  favIds: Set<string>;
  srcMatches: SRCMatch[];
  onWatch: (srcId: string, title: string, fallbackSearch: string) => void;
}) {
  const s = statusOf(m);
  const src = useMemo(
    () => (srcMatches.length ? findMatch(srcMatches, m.home, m.away, m.timestamp) : null),
    [srcMatches, m.home, m.away, m.timestamp],
  );
  const searchQ = `${m.home} vs ${m.away}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          {m.round}
        </span>
        <div className="flex items-center gap-2">
          {s.live && (
            <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> مباشر
            </span>
          )}
          {s.finished && <span className="font-semibold text-emerald-600">انتهت</span>}
          {s.upcoming && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatTimeAr(m.timestamp)}
            </span>
          )}
          {!s.finished && (
            <FavoriteButton
              size="sm"
              matchId={m.id}
              initiallyFavorited={favIds.has(m.id)}
              kickoffAt={m.timestamp}
              matchData={{
                home: m.home,
                away: m.away,
                homeBadge: m.homeBadge,
                awayBadge: m.awayBadge,
                venue: m.venue,
                round: m.round,
              }}
            />
          )}
        </div>
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
          {s.finished || s.live ? (
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

      {(s.live || s.upcoming) && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {src ? (
            <button
              onClick={() => onWatch(src.id, `${m.home} vs ${m.away}`, searchQ)}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
                s.live
                  ? "bg-red-600 hover:bg-red-700 animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              {s.live ? "شاهد البث المباشر الآن" : "شاهد البث المباشر"}
            </button>
          ) : (
            <a
              href="https://tv.bouibacademy.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 px-4 py-2.5 text-sm font-bold text-primary-foreground transition"
            >
              <Tv className="h-4 w-4" />
              افتح البث على StreamHub
            </a>
          )}
          <a
            href={`https://www.livesoccertv.com/search/?q=${encodeURIComponent(searchQ)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border hover:border-primary px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition"
          >
            <Radio className="h-3.5 w-3.5" />
            القنوات الناقلة حسب بلدك (LiveSoccerTV)
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function YKMatchCard({ m }: { m: YKMatch }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="inline-flex items-center gap-1.5 truncate max-w-[65%]">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{m.league || "مباراة"}</span>
        </span>
        {m.live ? (
          <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> مباشر
          </span>
        ) : m.finished ? (
          <span className="font-semibold text-emerald-600">انتهت</span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {m.time}
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
          {m.finished || m.live ? (
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
        {m.channel && (
          <div className="flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{m.channel}</span>
          </div>
        )}
        {m.commentator && (
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            {m.commentator}
          </div>
        )}
      </div>

      {!m.finished && m.matchUrl && (
        <a
          href={m.matchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
            m.live ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <PlayCircle className="h-4 w-4" />
          {m.live ? "شاهد البث المباشر الآن" : "تفاصيل المباراة والبث"}
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      )}
      {m.finished && m.matchUrl && (
        <a
          href={m.matchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border hover:border-primary px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition"
        >
          ملخّص وأهداف المباراة <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function StandingsTable({ standings }: { standings: WCStanding[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, WCStanding[]>();
    standings.forEach((s) => {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group)!.push(s);
    });
    for (const arr of map.values()) arr.sort((a, b) => a.rank - b.rank);
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [standings]);

  if (standings.length === 0) {
    return <div className="text-center py-16 text-muted-foreground">جدول الترتيب سيظهر بعد انطلاق البطولة.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map(([group, rows]) => (
        <div key={group} className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          <div className="bg-gradient-to-l from-primary/10 to-transparent px-5 py-3 border-b border-border">
            <h3 className="font-display font-bold text-lg">{group}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-right px-3 py-2 font-semibold">#</th>
                  <th className="text-right px-3 py-2 font-semibold">المنتخب</th>
                  <th className="px-2 py-2 font-semibold" title="لعب">ل</th>
                  <th className="px-2 py-2 font-semibold" title="فاز">ف</th>
                  <th className="px-2 py-2 font-semibold" title="تعادل">ت</th>
                  <th className="px-2 py-2 font-semibold" title="خسر">خ</th>
                  <th className="px-2 py-2 font-semibold" title="فارق الأهداف">+/-</th>
                  <th className="px-2 py-2 font-semibold text-primary">نقاط</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.team} className="border-t border-border hover:bg-accent/30 transition">
                    <td className="px-3 py-2.5 font-bold text-muted-foreground">{r.rank}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {r.badge && <img src={r.badge} alt="" className="h-5 w-5 object-contain" loading="lazy" />}
                        <span className="font-semibold">{r.team}</span>
                      </div>
                    </td>
                    <td className="text-center tabular-nums">{r.played}</td>
                    <td className="text-center tabular-nums text-emerald-600 font-semibold">{r.win}</td>
                    <td className="text-center tabular-nums">{r.draw}</td>
                    <td className="text-center tabular-nums text-red-500">{r.loss}</td>
                    <td className="text-center tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td className="text-center tabular-nums font-extrabold text-primary">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

type Tab = "live" | "today" | "all" | "standings" | "channels";

function WorldCupPage() {
  const { data } = useSuspenseQuery(wcQuery);
  const { data: standingsData } = useSuspenseQuery(standingsQuery);
  const { data: yk } = useQuery(ykQuery);
  const cd = useCountdown(TOURNAMENT_START);
  const [tab, setTab] = useState<Tab>("live");
  useBrowserReminders();
  const [watch, setWatch] = useState<{ id: string; title: string; fallback: string } | null>(null);
  const { data: srcMatches = [] } = useQuery(srcQuery);
  const onWatch = (id: string, title: string, fallback: string) =>
    setWatch({ id, title, fallback });

  const { data: favData } = useQuery({
    queryKey: ["favorites", "ids"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return { ids: [] as string[] };
      const { data: rows } = await supabase.from("match_favorites").select("match_id");
      return { ids: (rows ?? []).map((r) => r.match_id as string) };
    },
    staleTime: 30_000,
  });
  const favIds = useMemo(() => new Set(favData?.ids ?? []), [favData]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMatches = useMemo(() => data.matches.filter((m) => m.date === todayStr), [data.matches, todayStr]);

  // Group all matches by day for the full schedule tab
  const byDay = useMemo(() => {
    const groups = new Map<string, WCMatch[]>();
    data.matches.forEach((m) => {
      if (!groups.has(m.date)) groups.set(m.date, []);
      groups.get(m.date)!.push(m);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data.matches]);

  const now = Date.now();
  const liveCount = data.matches.filter((m) => statusOf(m).live).length;
  const finishedCount = data.matches.filter((m) => statusOf(m).finished).length;
  const upcomingCount = data.matches.filter((m) => {
    const s = statusOf(m);
    return s.upcoming && new Date(m.timestamp).getTime() > now;
  }).length;

  const ykTodayCount = yk?.today.length ?? 0;
  const ykLiveCount = yk?.today.filter((m) => m.live).length ?? 0;
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "live", label: "بث مباشر (يلا كورة)", count: ykLiveCount || ykTodayCount },
    { key: "today", label: "مباريات اليوم", count: todayMatches.length },
    { key: "all", label: "الجدول الكامل", count: data.matches.length },
    { key: "standings", label: "ترتيب المجموعات", count: standingsData.standings.length },
    { key: "channels", label: "قنوات البث" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative hero-bg overflow-hidden border-b border-border">
        <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
        <div className="container-page relative py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6 shadow-soft">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            المونديال 2026 — أمريكا · كندا · المكسيك
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="gradient-text">كأس العالم 2026</span>
            <br />
            الجدول الكامل · الترتيب · البث المباشر
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-muted-foreground">
            جميع مباريات المونديال بتوقيتك، ترتيب المجموعات لحظة بلحظة، ومباريات اليوم مع القنوات الناقلة وروابط المشاهدة الرسمية المباشرة.
          </p>

          {/* Live stats strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { l: "مباشر الآن", v: liveCount, c: "text-red-500" },
              { l: "اليوم", v: todayMatches.length, c: "text-primary" },
              { l: "قادمة", v: upcomingCount, c: "text-blue-600" },
              { l: "منتهية", v: finishedCount, c: "text-emerald-600" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
                <div className={`font-display text-2xl font-extrabold tabular-nums ${s.c}`}>{s.v}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          {!cd.done && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-card">
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

      {/* TABS */}
      <section className="container-page py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface border-border hover:border-primary hover:text-primary"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-xs rounded-full px-2 py-0.5 ${tab === t.key ? "bg-primary-foreground/20" : "bg-accent"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LIVE — Yallakora */}
        {tab === "live" && (
          <div className="space-y-10">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                بث مباشر — مباريات اليوم مع القنوات الناقلة
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                بيانات محدّثة من <span className="font-semibold">يلا كورة</span> — أوقات بتوقيت الرياض،
                مع القناة الرسمية الناقلة ورابط مباشر لصفحة البث.
              </p>
            </div>

            {!yk ? (
              <div className="text-center py-16 text-muted-foreground">جارٍ تحميل مباريات اليوم…</div>
            ) : (
              <>
                {yk.today.length === 0 && yk.tomorrow.length === 0 && yk.yesterday.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
                    تعذّر جلب المباريات من يلا كورة الآن. حاول مجدّدًا بعد قليل.
                  </div>
                )}

                {yk.today.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-lg text-primary mb-4">
                      اليوم · {yk.today.length} مباراة
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {yk.today.map((m) => (
                        <YKMatchCard key={m.id} m={m} />
                      ))}
                    </div>
                  </div>
                )}

                {yk.tomorrow.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-lg text-primary mb-4">
                      الغد · {yk.tomorrow.length} مباراة
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {yk.tomorrow.map((m) => (
                        <YKMatchCard key={m.id} m={m} />
                      ))}
                    </div>
                  </div>
                )}

                {yk.yesterday.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-lg text-muted-foreground mb-4">
                      أمس · {yk.yesterday.length} مباراة
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {yk.yesterday.map((m) => (
                        <YKMatchCard key={m.id} m={m} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TODAY */}
        {tab === "today" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold">مباريات اليوم مع القنوات الناقلة</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDayAr(todayStr)} — اضغط على القناة لفتح البث المباشر
              </p>
            </div>
            {todayMatches.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
                لا توجد مباريات مبرمجة اليوم. تفقّد الجدول الكامل للاطلاع على المباريات القادمة.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {todayMatches.map((m) => (
                  <MatchCard key={m.id} m={m} favIds={favIds} srcMatches={srcMatches} onWatch={onWatch} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL — grouped by day */}
        {tab === "all" && (
          <div className="space-y-10">
            {byDay.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">لم تُنشر مباريات بعد.</div>
            )}
            {byDay.map(([day, matches]) => (
              <div key={day}>
                <div className="sticky top-16 z-10 mb-4 -mx-4 px-4 py-2 backdrop-blur bg-background/80 border-b border-border">
                  <h3 className="font-display font-bold text-lg text-primary">{formatDayAr(day)}</h3>
                  <p className="text-xs text-muted-foreground">{matches.length} مباراة</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {matches.map((m) => (
                    <MatchCard key={m.id} m={m} favIds={favIds} srcMatches={srcMatches} onWatch={onWatch} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STANDINGS */}
        {tab === "standings" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold">ترتيب المجموعات</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                يُحدَّث تلقائيًا بعد نهاية كل مباراة — النقاط، فارق الأهداف، وأداء المنتخبات.
              </p>
            </div>
            <StandingsTable standings={standingsData.standings} />
          </div>
        )}

        {/* CHANNELS */}
        {tab === "channels" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold">قنوات البث الرسمية للمونديال</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
                اختر المنصة المتاحة في بلدك لمشاهدة المباريات بجودة عالية وبشكل قانوني — روابط مباشرة إلى صفحات البث.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OFFICIAL_STREAMS.map((s) => (
                <a
                  key={s.name}
                  href={s.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white ${s.color}`}>
                      <Radio className="h-5 w-5" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                  </div>
                  <div className="font-display font-bold text-lg">{s.name}</div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.note}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    فتح البث المباشر ←
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
      {watch && (
        <StreamModal
          matchId={watch.id}
          title={watch.title}
          fallbackSearch={watch.fallback}
          onClose={() => setWatch(null)}
        />
      )}
    </div>
  );
}
