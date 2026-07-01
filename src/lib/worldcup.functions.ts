import { createServerFn } from "@tanstack/react-start";

const API = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUE_ID = "4429"; // FIFA World Cup
const SEASON = "2026";

export interface WCMatch {
  id: string;
  home: string;
  away: string;
  homeBadge?: string;
  awayBadge?: string;
  homeScore: number | null;
  awayScore: number | null;
  timestamp: string; // ISO UTC
  date: string;
  round: string;
  venue?: string;
  status: string; // FT, NS, LIVE...
  thumb?: string;
}

interface RawEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTimestamp: string;
  dateEvent: string;
  intRound: string;
  strVenue?: string;
  strStatus?: string;
  strThumb?: string;
  strPostponed?: string;
}

const ROUND_NAMES: Record<string, string> = {
  "1": "الجولة الأولى",
  "2": "الجولة الثانية",
  "3": "الجولة الثالثة",
  "125": "دور الـ32",
  "150": "دور الـ16",
  "200": "ربع النهائي",
  "500": "نصف النهائي",
  "150001": "تحديد المركز الثالث",
  "175": "تحديد المركز الثالث",
  "250": "تحديد المركز الثالث",
  "160": "المباراة النهائية",
};

function transformEvent(e: RawEvent): WCMatch {
  return {
    id: e.idEvent,
    home: e.strHomeTeam,
    away: e.strAwayTeam,
    homeBadge: e.strHomeTeamBadge,
    awayBadge: e.strAwayTeamBadge,
    homeScore: e.intHomeScore != null && e.intHomeScore !== "" ? Number(e.intHomeScore) : null,
    awayScore: e.intAwayScore != null && e.intAwayScore !== "" ? Number(e.intAwayScore) : null,
    timestamp: e.strTimestamp || `${e.dateEvent}T00:00:00`,
    date: e.dateEvent,
    round: ROUND_NAMES[e.intRound] ?? `الجولة ${e.intRound}`,
    venue: e.strVenue,
    status: e.strStatus ?? "NS",
    thumb: e.strThumb,
  };
}

export const getWorldCupMatches = createServerFn({ method: "GET" }).handler(async () => {
  const url = `${API}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return { matches: [] as WCMatch[] };
  const json = (await res.json()) as { events: RawEvent[] | null };
  const matches = (json.events ?? []).map(transformEvent).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { matches };
});
