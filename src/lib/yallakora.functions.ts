import { createServerFn } from "@tanstack/react-start";
import { parse } from "node-html-parser";

const BASE = "https://www.yallak0ra.com";

export interface YKMatch {
  id: string;
  home: string;
  away: string;
  homeBadge?: string;
  awayBadge?: string;
  time: string; // e.g. "11:00 PM" (بتوقيت الرياض)
  homeScore: number | null;
  awayScore: number | null;
  status: string; // نصّ: لم تبدأ بعد / انتهت / جارية...
  live: boolean;
  finished: boolean;
  channel?: string;
  commentator?: string;
  league?: string;
  matchUrl: string; // صفحة يلا كورة (فيها البث)
  day: "yesterday" | "today" | "tomorrow";
}

const PAGES: Record<YKMatch["day"], string> = {
  yesterday: `${BASE}/matches-yesterday/`,
  today: `${BASE}/matches-today/`,
  tomorrow: `${BASE}/matches-tomorrow/`,
};

function parseImg(html: string): { alt?: string; src?: string } {
  const alt = html.match(/alt="([^"]+)"/)?.[1];
  const src =
    html.match(/data-src=["']([^"']+)["']/)?.[1] ||
    html.match(/(?<!data-)src=["'](https?:[^"']+)["']/)?.[1];
  return { alt, src };
}

function parseCard(html: string, day: YKMatch["day"]): YKMatch | null {
  const root = parse(`<div>${html}</div>`);
  const t1 = root.querySelector(".TM_Team.TM1");
  const t2 = root.querySelector(".TM_Team.TM2");
  if (!t1 || !t2) return null;
  const homeName = t1.querySelector(".TM_Name")?.text.trim() || "";
  const awayName = t2.querySelector(".TM_Name")?.text.trim() || "";
  const homeImg = parseImg(t1.querySelector(".TM_Logo img")?.toString() || "");
  const awayImg = parseImg(t2.querySelector(".TM_Logo img")?.toString() || "");
  const time = root.querySelector(".MT_Time")?.text.trim() || "";
  const scoreEls = root.querySelectorAll(".MT_Result .RS-goals");
  const homeScore = scoreEls[0]?.text.trim();
  const awayScore = scoreEls[1]?.text.trim();
  const status = root.querySelector(".MT_Stat")?.text.trim() || "";
  const infos = root.querySelectorAll(".MT_Info li span").map((s) => s.text.trim());
  const link = root.querySelector("a[href*='/matches/']")?.getAttribute("href") || "";
  const finished = status.includes("انتهت");
  const live =
    !finished &&
    (status.includes("جارية") || status.includes("مباشر") || /^\d+\s*'/.test(status));
  const id =
    link.match(/\/matches\/([^/]+)/)?.[1] ||
    `${homeName}-${awayName}-${day}`.replace(/\s+/g, "-");
  return {
    id,
    home: homeName,
    away: awayName,
    homeBadge: homeImg.src,
    awayBadge: awayImg.src,
    time,
    homeScore: homeScore ? Number(homeScore) : null,
    awayScore: awayScore ? Number(awayScore) : null,
    status,
    live,
    finished,
    channel: infos[0] && infos[0] !== "غير معروف" ? infos[0] : undefined,
    commentator: infos[1] && infos[1] !== "غير معروف" ? infos[1] : undefined,
    league: infos[2],
    matchUrl: link,
    day,
  };
}

async function scrape(day: YKMatch["day"]): Promise<YKMatch[]> {
  const res = await fetch(PAGES[day], {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BouibAcademyBot/1.0; +https://edu.bouibacademy.me)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  // Split on the AY_Match div opener; keep everything up to the next opener.
  const parts = html.split('<div class="AY_Match');
  const cards: YKMatch[] = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = '<div class="AY_Match' + parts[i].split('<div class="AY_Match')[0];
    // Trim to the card's closing (heuristic: up to the trailing anchor's closing div).
    const m = parseCard(chunk, day);
    if (m && m.home && m.away) cards.push(m);
  }
  return cards;
}

export const getYallakoraMatches = createServerFn({ method: "GET" }).handler(async () => {
  const [yesterday, today, tomorrow] = await Promise.all([
    scrape("yesterday").catch(() => []),
    scrape("today").catch(() => []),
    scrape("tomorrow").catch(() => []),
  ]);
  return { yesterday, today, tomorrow, fetchedAt: new Date().toISOString() };
});
